import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '@/models/User.js';
import { generateToken } from '@/middleware/auth.js';
import { emailService } from '@/services/emailService.js';
import { ApiResponse } from '@/types/api.js';
import { asyncHandler, AppError, AuthenticationError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';
import { cacheService } from '@/services/cacheService.js';

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Name must be 1-100 characters')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const register = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Create user
  const user = await UserModel.create({ email, password, name });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Send welcome email
  await emailService.sendWelcomeEmail(user.email, user.name);

  logger.info('User registered successfully', {
    userId: user.id,
    email: user.email,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.email_verified
      },
      token
    },
    message: 'User registered successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.status(201).json(response);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { email, password } = req.body;

  // Check rate limiting for this email
  const rateLimitKey = `login_attempts:${email}`;
  const attempts = cacheService.get<number>(rateLimitKey) || 0;
  
  if (attempts >= 5) {
    throw new AuthenticationError('Too many login attempts. Please try again later.');
  }

  // Verify credentials
  const user = await UserModel.verifyPassword(email, password);
  if (!user) {
    // Increment rate limit counter
    cacheService.set(rateLimitKey, attempts + 1, 900); // 15 minutes
    throw new AuthenticationError('Invalid credentials');
  }

  if (!user.is_active) {
    throw new AuthenticationError('Account is deactivated');
  }

  // Clear rate limit on successful login
  cacheService.del(rateLimitKey);

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  logger.info('User logged in successfully', {
    userId: user.id,
    email: user.email,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.email_verified
      },
      token
    },
    message: 'Login successful',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a more sophisticated setup, you might want to blacklist the token
  logger.info('User logged out', {
    userId: (req as any).user?.userId,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    message: 'Logout successful',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login
    },
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.userId;
  const { name, email } = req.body;

  const updateData: any = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;

  const user = await UserModel.update(userId, updateData);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  logger.info('User profile updated', {
    userId,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.email_verified
    },
    message: 'Profile updated successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});