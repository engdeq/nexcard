import { Router } from 'express';
import {
  createProfile,
  getMyProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
  getProfileStats,
  createProfileValidation,
  updateProfileValidation,
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get('/stats/summary', getProfileStats);
router.post('/', createProfileValidation, validate, createProfile);
router.get('/my', getMyProfiles);
router.get('/:id', getProfile);
router.put('/:id', updateProfileValidation, validate, updateProfile);
router.delete('/:id', deleteProfile);

export default router;
