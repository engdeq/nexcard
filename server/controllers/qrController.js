import { body, query } from 'express-validator';
import QRCodeLib from 'qrcode';
import { QRCode, QR_TYPES } from '../models/QRCode.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildQrContent } from '../utils/qrPayload.js';

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateContentByType(type, content) {
  if (!content || typeof content !== 'object') {
    throw new AppError('Content is required', 400);
  }

  switch (type) {
    case 'website':
    case 'pdf':
    case 'image':
    case 'app':
    case 'menu':
    case 'business':
      if (!content.url || !isValidHttpUrl(content.url)) {
        throw new AppError('A valid URL is required', 400);
      }
      break;
    case 'text':
      if (!content.text?.trim()) {
        throw new AppError('Text content is required', 400);
      }
      break;
    case 'vcard':
      if (!content.fullName?.trim()) {
        throw new AppError('Full name is required for vCard', 400);
      }
      break;
    case 'wifi':
      if (!content.ssid?.trim()) {
        throw new AppError('Wi-Fi SSID is required', 400);
      }
      break;
    case 'social':
      if (!content.url && !(content.links?.length)) {
        throw new AppError('At least one social URL is required', 400);
      }
      if (content.url && !isValidHttpUrl(content.url)) {
        throw new AppError('A valid social URL is required', 400);
      }
      break;
    default:
      throw new AppError('Invalid QR type', 400);
  }
}

export const createQrValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('type').isIn(QR_TYPES).withMessage('Invalid QR type'),
  body('content').isObject().withMessage('Content must be an object'),
  body('customization').optional().isObject(),
];

export const updateQrValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 120 }),
  body('type').optional().isIn(QR_TYPES).withMessage('Invalid QR type'),
  body('content').optional().isObject(),
  body('customization').optional().isObject(),
];

export const listQrValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(QR_TYPES),
  query('search').optional().isString(),
];

export const createQr = asyncHandler(async (req, res) => {
  const { title, type, content, customization } = req.body;
  validateContentByType(type, content);
  const payload = buildQrContent(type, content);

  if (!payload) {
    throw new AppError('Unable to build QR payload from content', 400);
  }

  const qr = await QRCode.create({
    userId: req.user._id,
    title,
    type,
    content,
    payload,
    customization: {
      foregroundColor: customization?.foregroundColor || '#111827',
      backgroundColor: customization?.backgroundColor || '#FFFFFF',
      logoUrl: customization?.logoUrl || '',
    },
  });

  res.status(201).json({ success: true, data: qr });
});

export const listQr = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const skip = (page - 1) * limit;
  const filter = { userId: req.user._id };

  if (req.query.type) filter.type = req.query.type;
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    QRCode.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    QRCode.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
});

export const getQr = asyncHandler(async (req, res) => {
  const qr = await QRCode.findById(req.params.id);
  if (!qr) throw new AppError('QR code not found', 404);
  if (qr.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  res.json({ success: true, data: qr });
});

export const updateQr = asyncHandler(async (req, res) => {
  const qr = await QRCode.findById(req.params.id);
  if (!qr) throw new AppError('QR code not found', 404);
  if (qr.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  const type = req.body.type || qr.type;
  const content = req.body.content || qr.content;
  validateContentByType(type, content);
  const payload = buildQrContent(type, content);

  if (req.body.title) qr.title = req.body.title;
  qr.type = type;
  qr.content = content;
  qr.payload = payload;
  if (req.body.customization) {
    qr.customization = {
      ...qr.customization.toObject?.() || qr.customization,
      ...req.body.customization,
    };
  }

  await qr.save();
  res.json({ success: true, data: qr });
});

export const deleteQr = asyncHandler(async (req, res) => {
  const qr = await QRCode.findById(req.params.id);
  if (!qr) throw new AppError('QR code not found', 404);
  if (qr.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }
  await qr.deleteOne();
  res.json({ success: true, message: 'QR code deleted' });
});

export const generatePreview = asyncHandler(async (req, res) => {
  const { type, content, format = 'png', foregroundColor, backgroundColor } = req.body;
  if (!QR_TYPES.includes(type)) throw new AppError('Invalid QR type', 400);
  validateContentByType(type, content);
  const payload = buildQrContent(type, content);
  if (!payload) throw new AppError('Unable to build QR payload', 400);

  const options = {
    errorCorrectionLevel: 'M',
    color: {
      dark: foregroundColor || '#111827',
      light: backgroundColor || '#FFFFFF',
    },
    margin: 2,
    width: 400,
  };

  if (format === 'svg') {
    const svg = await QRCodeLib.toString(payload, { ...options, type: 'svg' });
    res.json({ success: true, format: 'svg', data: svg, payload });
  } else {
    const dataUrl = await QRCodeLib.toDataURL(payload, options);
    res.json({ success: true, format: 'png', data: dataUrl, payload });
  }
});

export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [totalQr, recent] = await Promise.all([
    QRCode.countDocuments({ userId }),
    QRCode.find({ userId }).sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    success: true,
    data: {
      totalQr,
      recent,
    },
  });
});
