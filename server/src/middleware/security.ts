import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config/environment.js';
import { logger } from '@/config/logger.js';
import { RateLimitError } from './errorHandler.js';

// Request ID middleware
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// CSRF Token generation
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = uuidv4();
  }
  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Enhanced rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId
    });
    
    throw new RateLimitError('Rate limit exceeded');
  }
});

// AI-specific rate limiting (more restrictive)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for AI endpoints
  message: {
    success: false,
    error: 'AI service rate limit exceeded. Please wait before making another request.',
    code: 'AI_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Expensive operations rate limiting
export const expensiveOperationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 requests per 5 minutes
  message: {
    success: false,
    error: 'Too many expensive operations. Please wait before trying again.',
    code: 'EXPENSIVE_OPERATION_LIMIT_EXCEEDED'
  }
});

// Speed limiting (progressive delays)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.gemini.google.com"],
      reportUri: config.cspReportUri
    }
  },
  hsts: {
    maxAge: config.hstsMaxAge,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false // Allow embedding for development
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize against NoSQL injection
  mongoSanitize()(req, res, () => {
    // Protect against HTTP Parameter Pollution
    hpp()(req, res, () => {
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
    });
  });
};

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/|\/var\/)/,
    /(union|select|insert|delete|drop|create|alter|exec|execute)/i,
    /(<script|javascript:|vbscript:|onload=|onerror=)/i,
    /(\${|<%|%>|{{|}})/i
  ];

  const requestData = JSON.stringify({
    query: req.query,
    body: req.body,
    params: req.params
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        path: req.path,
        pattern: pattern.toString(),
        requestId: req.requestId
      });
      break;
    }
  }

  next();
};

// API Key validation (optional)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Skip API key validation for now - can be implemented later
  next();
};

// Declare module augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
    interface Session {
      csrfToken?: string;
    }
  }
}