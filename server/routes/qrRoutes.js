import { Router } from 'express';
import {
  createQr,
  listQr,
  getQr,
  updateQr,
  deleteQr,
  generatePreview,
  getStats,
  createQrValidation,
  updateQrValidation,
  listQrValidation,
} from '../controllers/qrController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/stats/summary', getStats);
router.post('/preview', generatePreview);
router.post('/', createQrValidation, validate, createQr);
router.get('/', listQrValidation, validate, listQr);
router.get('/:id', getQr);
router.put('/:id', updateQrValidation, validate, updateQr);
router.delete('/:id', deleteQr);

export default router;
