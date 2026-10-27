import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePhoto: { type: String, default: '' },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    jobTitle: { type: String, default: '', trim: true, maxlength: 120 },
    company: { type: String, default: '', trim: true, maxlength: 120 },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    website: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true, maxlength: 300 },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    socialLinks: { type: [socialLinkSchema], default: [] },
    accentColor: { type: String, default: '#3478F6' },
    coverImage: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    buttonStyle: {
      type: String,
      enum: ['solid', 'outline', 'rounded'],
      default: 'solid',
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

businessProfileSchema.index({ userId: 1 });

export const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema);
