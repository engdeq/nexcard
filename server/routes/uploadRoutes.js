import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { uploadAny } from '../middleware/upload.js';
import { uploadFile } from '../controllers/uploadController.js';

const router = Router();

router.post('/', protect, uploadAny.single('file'), uploadFile);

export default router;
