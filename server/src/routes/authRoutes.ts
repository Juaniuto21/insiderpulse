import { Router } from 'express';
import { 
  register,
  registerValidation,
  login,
  loginValidation,
  logout,
  getProfile,
  updateProfile
} from '@/controllers/authController.js';
import { authenticate } from '@/middleware/auth.js';
import { rateLimiter } from '@/middleware/security.js';

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @body email, password, name
 * @access Public
 */
router.post('/register', rateLimiter, registerValidation, register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @body email, password
 * @access Public
 */
router.post('/login', rateLimiter, loginValidation, login);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route PUT /api/v1/auth/profile
 * @desc Update user profile
 * @body name, email
 * @access Private
 */
router.put('/profile', authenticate, updateProfile);

export default router;