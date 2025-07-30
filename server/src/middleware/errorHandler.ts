import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger.js';
import { ApiResponse } from '@/types/api.js';
import { config } from '@/config/environment.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
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

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }

  // Log error details
  logger.error('API Error', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      isOperational
    },
    request: {
      id: req.requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  // In development, include stack trace
  if (config.nodeEnv === 'development') {
    (errorResponse as any).stack = error.stack;
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = 'Validation failed';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorResponse.error = 'Invalid data format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error = 'Token expired';
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};