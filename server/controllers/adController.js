import { body, query } from 'express-validator';
import { Advertisement, AD_PLACEMENTS } from '../models/Advertisement.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const createAdValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').optional().isString().isLength({ max: 300 }),
  body('imageUrl').trim().notEmpty().withMessage('Banner image is required'),
  body('destinationUrl')
    .optional({ values: 'falsy' })
    .custom((v) => isValidHttpUrl(v))
    .withMessage('Destination URL must be valid'),
  body('placement').isIn(AD_PLACEMENTS).withMessage('Invalid placement'),
  body('startDate').optional({ values: 'falsy' }).isISO8601(),
  body('endDate').optional({ values: 'falsy' }).isISO8601(),
  body('isActive').optional().isBoolean(),
];

export const updateAdValidation = createAdValidation.map((rule) =>
  rule.builder ? rule.optional() : rule
);

export const listAdValidation = [
  query('placement').optional().isIn(AD_PLACEMENTS),
];

export const createAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.create({
    userId: req.user._id,
    title: req.body.title,
    description: req.body.description || '',
    imageUrl: req.body.imageUrl,
    destinationUrl: req.body.destinationUrl || '',
    placement: req.body.placement,
    startDate: req.body.startDate || null,
    endDate: req.body.endDate || null,
    isActive: req.body.isActive !== false,
  });
  res.status(201).json({ success: true, data: ad });
});

export const listAds = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.placement) filter.placement = req.query.placement;
  const ads = await Advertisement.find(filter).sort({ updatedAt: -1 });
  res.json({ success: true, data: ads });
});

export const getAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new AppError('Advertisement not found', 404);
  if (ad.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  res.json({ success: true, data: ad });
});

export const updateAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new AppError('Advertisement not found', 404);
  if (ad.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const fields = [
    'title',
    'description',
    'imageUrl',
    'destinationUrl',
    'placement',
    'startDate',
    'endDate',
    'isActive',
  ];
  for (const field of fields) {
    if (req.body[field] !== undefined) ad[field] = req.body[field];
  }
  await ad.save();
  res.json({ success: true, data: ad });
});

export const deleteAd = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findById(req.params.id);
  if (!ad) throw new AppError('Advertisement not found', 404);
  if (ad.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  await ad.deleteOne();
  res.json({ success: true, message: 'Advertisement deleted' });
});

export const getActiveAds = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = {
    userId: req.user._id,
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };
  if (req.query.placement) filter.placement = req.query.placement;
  const ads = await Advertisement.find(filter).sort({ updatedAt: -1 });
  res.json({ success: true, data: ads });
});
