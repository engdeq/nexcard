import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  me,
  logout,
  updateProfile,
  changePassword,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public registration is disabled
router.post('/register', authLimiter, (_req, res) => {
  res.status(403).json({
    success: false,
    message: 'Registration is closed. Please contact the administrator.',
  });
});
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, me);
router.post('/logout', logout);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/password', protect, changePasswordValidation, validate, changePassword);

export default router;
