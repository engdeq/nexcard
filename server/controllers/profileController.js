import { body } from 'express-validator';
import slugify from 'slugify';
import { BusinessProfile } from '../models/BusinessProfile.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildVCard } from '../utils/qrPayload.js';

async function ensureUniqueSlug(base, excludeId = null) {
  let slug = slugify(base, { lower: true, strict: true }) || 'profile';
  let candidate = slug;
  let i = 1;
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await BusinessProfile.findOne(query);
    if (!exists) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

export const createProfileValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 120 }),
  body('jobTitle').optional().isString().isLength({ max: 120 }),
  body('company').optional().isString().isLength({ max: 120 }),
  body('phone').optional().isString(),
  body('email')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('website').optional().isString(),
  body('address').optional().isString().isLength({ max: 300 }),
  body('bio').optional().isString().isLength({ max: 1000 }),
  body('socialLinks').optional().isArray(),
  body('isPublished').optional().isBoolean(),
  body('slug').optional().isString(),
];

export const updateProfileValidation = createProfileValidation;

export const createProfile = asyncHandler(async (req, res) => {
  const baseSlug = req.body.slug || req.body.fullName;
  const slug = await ensureUniqueSlug(baseSlug);

  const profile = await BusinessProfile.create({
    userId: req.user._id,
    slug,
    profilePhoto: req.body.profilePhoto || '',
    fullName: req.body.fullName,
    jobTitle: req.body.jobTitle || '',
    company: req.body.company || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    website: req.body.website || '',
    address: req.body.address || '',
    bio: req.body.bio || '',
    socialLinks: req.body.socialLinks || [],
    accentColor: req.body.accentColor || '#3478F6',
    coverImage: req.body.coverImage || '',
    companyLogo: req.body.companyLogo || '',
    buttonStyle: req.body.buttonStyle || 'solid',
    isPublished: !!req.body.isPublished,
  });

  res.status(201).json({ success: true, data: profile });
});

export const getMyProfiles = asyncHandler(async (req, res) => {
  const profiles = await BusinessProfile.find({ userId: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json({ success: true, data: profiles });
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);
  if (!profile) throw new AppError('Profile not found', 404);
  if (profile.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  res.json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);
  if (!profile) throw new AppError('Profile not found', 404);
  if (profile.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const fields = [
    'profilePhoto',
    'fullName',
    'jobTitle',
    'company',
    'phone',
    'email',
    'website',
    'address',
    'bio',
    'socialLinks',
    'accentColor',
    'coverImage',
    'companyLogo',
    'buttonStyle',
    'isPublished',
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      profile[field] = req.body[field];
    }
  }

  if (req.body.slug || (req.body.fullName && req.body.regenerateSlug)) {
    const base = req.body.slug || req.body.fullName;
    profile.slug = await ensureUniqueSlug(base, profile._id);
  }

  await profile.save();
  res.json({ success: true, data: profile });
});

export const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findById(req.params.id);
  if (!profile) throw new AppError('Profile not found', 404);
  if (profile.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  await profile.deleteOne();
  res.json({ success: true, message: 'Profile deleted' });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findOne({
    slug: req.params.slug.toLowerCase(),
    isPublished: true,
  }).select('-userId');

  if (!profile) throw new AppError('Profile not found', 404);

  res.json({
    success: true,
    data: {
      slug: profile.slug,
      profilePhoto: profile.profilePhoto,
      fullName: profile.fullName,
      jobTitle: profile.jobTitle,
      company: profile.company,
      phone: profile.phone,
      email: profile.email,
      website: profile.website,
      address: profile.address,
      bio: profile.bio,
      socialLinks: profile.socialLinks,
      accentColor: profile.accentColor,
      coverImage: profile.coverImage,
      companyLogo: profile.companyLogo,
      buttonStyle: profile.buttonStyle,
    },
  });
});

export const downloadPublicVcard = asyncHandler(async (req, res) => {
  const profile = await BusinessProfile.findOne({
    slug: req.params.slug.toLowerCase(),
    isPublished: true,
  });

  if (!profile) throw new AppError('Profile not found', 404);

  const vcard = buildVCard({
    fullName: profile.fullName,
    company: profile.company,
    jobTitle: profile.jobTitle,
    phone: profile.phone,
    email: profile.email,
    website: profile.website,
    address: profile.address,
  });

  res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${profile.slug}.vcf"`
  );
  res.send(vcard);
});

export const getProfileStats = asyncHandler(async (req, res) => {
  const total = await BusinessProfile.countDocuments({ userId: req.user._id });
  const published = await BusinessProfile.countDocuments({
    userId: req.user._id,
    isPublished: true,
  });
  res.json({ success: true, data: { total, published } });
});
