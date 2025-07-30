import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { config } from '@/config/environment.js';
import { logger } from '@/config/logger.js';

// Enhanced rate limiting with different tiers
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded: ${message}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
      res.status(429).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Rate limiting
export const rateLimiter = createRateLimiter(
  config.rateLimitWindowMs,
  config.rateLimitMax,
  'Too many requests from this IP, please try again later.'
);

// Stricter rate limiting for AI endpoints
export const aiRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per 15 minutes
  'Too many AI analysis requests. Please wait before making more requests.'
);

// Very strict rate limiting for expensive operations
export const expensiveOperationLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 requests per hour
  'Rate limit exceeded for expensive operations. Please try again later.'
);

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
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "https://source.unsplash.com"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://api.gemini.google.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      reportUri: config.cspReportUri ? [config.cspReportUri] : undefined,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: config.hstsMaxAge,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
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

// Enhanced request validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check request size
  const contentLength = req.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    logger.warn('Request too large', {
      ip: req.ip,
      contentLength,
      path: req.path
    });
    return res.status(413).json({
      success: false,
      error: 'Request entity too large',
      timestamp: new Date().toISOString()
    });
  }

  // Enhanced suspicious pattern detection
  const suspiciousPatterns = [
    /(<script|javascript:|vbscript:|onload=|onerror=)/i,
    /(union|select|insert|delete|drop|create|alter|exec|execute)/i,
    /(\.\.|\/etc\/|\/proc\/|\/sys\/|\/var\/)/i,
    /(base64|eval|fromcharcode|unescape)/i,
    /(\${|<%|%>|{{|}})/i, // Template injection patterns
    /(wget|curl|nc|netcat|bash|sh|cmd|powershell)/i,
  ];

  const requestData = JSON.stringify({
    query: req.query,
    body: req.body,
    params: req.params,
    headers: {
      'user-agent': req.get('User-Agent'),
      'referer': req.get('Referer'),
      'origin': req.get('Origin')
    }
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        pattern: pattern.source,
        matchedContent: requestData.substring(0, 200)
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

// IP whitelist/blacklist middleware
export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip;
  
  // In production, you might want to implement IP blacklisting
  const blacklistedIPs = process.env.BLACKLISTED_IPS?.split(',') || [];
  
  if (blacklistedIPs.includes(clientIp)) {
    logger.warn('Blocked request from blacklisted IP', {
      ip: clientIp,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      success: false,
      error: 'Access denied',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Request validation middleware
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // Skip validation for same-origin requests and health checks
  if (req.path === '/health' || req.method === 'GET') {
    return next();
  }
  
  // In production, validate origin more strictly
  if (config.nodeEnv === 'production' && origin) {
    const allowedOrigins = config.corsOrigins;
    if (!allowedOrigins.includes(origin)) {
      logger.warn('Request from unauthorized origin', {
        ip: req.ip,
        origin,
        referer,
        path: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Unauthorized origin',
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

  // Validate API key format if provided
  if (apiKey && !/^[a-zA-Z0-9_-]{32,}$/.test(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key format',
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
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Request logging middleware
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('content-length')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Error Response', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}