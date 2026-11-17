import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  updatePushToken,
} from '../controllers/authController';
import auth from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  changePasswordValidation,
} from '../utils/validators';

const router = Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', auth, getProfile);
router.put('/profile', auth, profileUpdateValidation, updateProfile);
router.put('/change-password', auth, changePasswordValidation, changePassword);
router.put('/push-token', auth, updatePushToken);

export default router;
