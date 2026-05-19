import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);

export default router;
