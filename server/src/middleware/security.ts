import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { config } from '@/config/environment.js';
import { logger } from '@/config/logger.js';

// Rate limiting
export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Speed limiter for additional protection
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
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization
export const sanitizeInput = [
  mongoSanitize({
    replaceWith: '_'
  }),
  hpp({
    whitelist: ['category', 'region', 'tickers']
  })
];

// Request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Log suspicious requests
  const suspiciousPatterns = [
    /(<script|javascript:|vbscript:|onload=|onerror=)/i,
    /(union|select|insert|delete|drop|create|alter)/i,
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i
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
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        data: requestData
      });
      
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// API key validation (if needed for premium features)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  
  if (req.path.includes('/premium/') && !apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required for premium endpoints',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Request ID middleware for tracking
export const addRequestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}