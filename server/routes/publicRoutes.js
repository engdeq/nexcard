import { Router } from 'express';
import {
  getPublicProfile,
  downloadPublicVcard,
} from '../controllers/profileController.js';

const router = Router();

router.get('/profiles/:slug', getPublicProfile);
router.get('/profiles/:slug/vcard', downloadPublicVcard);

export default router;
