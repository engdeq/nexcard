import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { getPublicUploadUrl } from '../middleware/upload.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const url = getPublicUploadUrl(req.file.filename);
  res.status(201).json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  });
});
