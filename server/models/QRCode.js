import mongoose from 'mongoose';

export const QR_TYPES = [
  'website',
  'vcard',
  'pdf',
  'image',
  'social',
  'wifi',
  'text',
  'business',
  'app',
  'menu',
];

const qrCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: QR_TYPES,
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    payload: {
      type: String,
      required: true,
    },
    customization: {
      foregroundColor: { type: String, default: '#111827' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      logoUrl: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

qrCodeSchema.index({ userId: 1, createdAt: -1 });
qrCodeSchema.index({ userId: 1, type: 1 });

export const QRCode = mongoose.model('QRCode', qrCodeSchema);
