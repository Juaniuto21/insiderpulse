import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler.js';
import { logger } from '@/config/logger.js';

// Enhanced validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    logger.warn('Validation failed', {
      errors: errorDetails,
      path: req.path,
      method: req.method,
      requestId: req.requestId
    });
    
    throw new ValidationError('Validation failed', errorDetails);
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  ticker: param('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
    
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
    
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character'),
    
  name: body('name')
    .isLength({ min: 1, max: 100 })
    .trim()
    .escape()
    .withMessage('Name must be 1-100 characters'),
    
  id: param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
    
  page: query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .toInt()
    .withMessage('Page must be between 1 and 1000'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
    
  sortBy: query('sortBy')
    .optional()
    .isIn(['name', 'date', 'price', 'change', 'volume'])
    .withMessage('Invalid sort field'),
    
  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes
  const removeNullBytes = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = removeNullBytes(obj[key]);
      }
    }
    return obj;
  };

  req.body = removeNullBytes(req.body);
  req.query = removeNullBytes(req.query);
  req.params = removeNullBytes(req.params);
  
  next();
};

// Rate limiting validation
export const validateRateLimit = (windowMs: number, maxRequests: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const rateLimitInfo = {
      windowMs,
      maxRequests,
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset')
    };
    
    logger.debug('Rate limit check', {
      ip: req.ip,
      path: req.path,
      ...rateLimitInfo
    });
    
    next();
  };
};

// File upload validation
export const validateFileUpload = (
  allowedTypes: string[],
  maxSize: number = 5 * 1024 * 1024 // 5MB default
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }
    
    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      throw new ValidationError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (req.file.size > maxSize) {
      throw new ValidationError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
    
    // Check for malicious file names
    const dangerousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(req.file!.originalname))) {
      throw new ValidationError('Invalid file name');
    }
    
    next();
  };
};

// Custom validation chains
export const createValidationChain = (validations: ValidationChain[]) => {
  return [...validations, handleValidationErrors];
};