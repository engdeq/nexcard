import mongoose from 'mongoose';

export const AD_PLACEMENTS = [
  'hero',
  'dashboard',
  'qr_create',
  'business_card',
  'public_website',
];

const advertisementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    imageUrl: { type: String, required: true },
    destinationUrl: { type: String, default: '', trim: true },
    placement: {
      type: String,
      enum: AD_PLACEMENTS,
      required: true,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

advertisementSchema.index({ userId: 1, placement: 1, isActive: 1 });

export const Advertisement = mongoose.model('Advertisement', advertisementSchema);
