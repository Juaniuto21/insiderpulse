import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger.js';
import { ApiResponse } from '@/types/api.js';
import { config } from '@/config/environment.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error classes for better error handling
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, true, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, true, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, true, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', service?: string) {
    super(message, 502, true, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;
  let code = 'INTERNAL_ERROR';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
    code = error.code || 'APP_ERROR';
  }

  // Enhanced error logging
  const errorLog = {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      isOperational,
      code,
      name: error.name
    },
    request: {
      id: req.requestId,
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query,
      params: req.params
    }
  };

  // Log based on severity
  if (statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  } else {
    logger.info('API Error', errorLog);
  }

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  // In development, include stack trace
  if (config.nodeEnv === 'development') {
    (errorResponse as any).stack = error.stack;
    (errorResponse as any).details = {
      name: error.name,
      isOperational,
      originalMessage: error.message
    };
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = 'Validation failed';
    errorResponse.code = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorResponse.error = 'Invalid data format';
    errorResponse.code = 'CAST_ERROR';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = 'Invalid token';
    errorResponse.code = 'JWT_ERROR';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error = 'Token expired';
    errorResponse.code = 'JWT_EXPIRED';
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    statusCode = 400;
    errorResponse.error = 'Invalid JSON format';
    errorResponse.code = 'JSON_SYNTAX_ERROR';
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    statusCode = 502;
    errorResponse.error = 'External service unavailable';
    errorResponse.code = 'EXTERNAL_SERVICE_ERROR';
  } else if (error.code === 'ETIMEDOUT') {
    statusCode = 504;
    errorResponse.error = 'Request timeout';
    errorResponse.code = 'TIMEOUT_ERROR';
  }

  // Don't expose sensitive information in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    errorResponse.error = 'Internal server error';
    delete (errorResponse as any).details;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    referer: req.get('Referer')
  });

  res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handlers for uncaught exceptions
export const setupGlobalErrorHandlers = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception - Server will exit', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
    
    // Give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection - Server will exit', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
    
    // Give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};