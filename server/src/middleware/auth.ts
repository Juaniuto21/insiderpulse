import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '@/config/environment.js';
import { logger } from '@/config/logger.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// JWT token generation
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h',
    issuer: 'insiderpulse-api',
    audience: 'insiderpulse-client'
  });
};

// JWT token verification
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret, {
      issuer: 'insiderpulse-api',
      audience: 'insiderpulse-client'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcryptRounds);
};

// Password verification
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Authentication middleware
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = verifyToken(token);
    req.user = payload;
    
    logger.debug('User authenticated', {
      userId: payload.userId,
      role: payload.role,
      requestId: req.requestId
    });
    
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const payload = verifyToken(token);
      req.user = payload;
    } catch (error) {
      // Log but don't throw - this is optional auth
      logger.debug('Optional auth failed', { error: error.message });
    }
  }
  
  next();
};

// Role-based authorization
export const authorize = (...roles: Array<'user' | 'premium' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      throw new AuthorizationError('Insufficient permissions');
    }
    
    next();
  };
};

// Premium feature middleware
export const requirePremium = authorize('premium', 'admin');

// Admin only middleware
export const requireAdmin = authorize('admin');