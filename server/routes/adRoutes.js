import { Router } from 'express';
import {
  createAd,
  listAds,
  getAd,
  updateAd,
  deleteAd,
  getActiveAds,
  createAdValidation,
  listAdValidation,
} from '../controllers/adController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { body } from 'express-validator';
import { AD_PLACEMENTS } from '../models/Advertisement.js';

const router = Router();

router.use(protect);

router.get('/active', listAdValidation, validate, getActiveAds);
router.post('/', createAdValidation, validate, createAd);
router.get('/', listAdValidation, validate, listAds);
router.get('/:id', getAd);
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 120 }),
    body('description').optional().isString().isLength({ max: 300 }),
    body('imageUrl').optional().trim().notEmpty(),
    body('destinationUrl').optional({ values: 'falsy' }),
    body('placement').optional().isIn(AD_PLACEMENTS),
    body('startDate').optional({ values: 'falsy' }).isISO8601(),
    body('endDate').optional({ values: 'falsy' }).isISO8601(),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  updateAd
);
router.delete('/:id', deleteAd);

export default router;
