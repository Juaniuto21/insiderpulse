import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { AlertModel } from '@/models/Alert.js';
import { ApiResponse } from '@/types/api.js';
import { asyncHandler, AppError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const createAlertValidation = [
  body('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
  body('alert_type')
    .isLength({ min: 1, max: 100 })
    .withMessage('Alert type is required'),
  body('risk_level')
    .isIn(['CRITICAL', 'HIGH', 'MEDIUM'])
    .withMessage('Invalid risk level'),
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required')
];

export const createAlert = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.userId;
  const { ticker, alert_type, risk_level, title, description, expires_at } = req.body;

  const alert = await AlertModel.create({
    user_id: userId,
    ticker,
    alert_type,
    risk_level,
    title,
    description,
    expires_at: expires_at ? new Date(expires_at) : undefined
  });

  logger.info('Alert created', {
    alertId: alert.id,
    userId,
    ticker,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    data: alert,
    message: 'Alert created successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.status(201).json(response);
});

export const getUserAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const limit = parseInt(req.query.limit as string) || 50;

  const alerts = await AlertModel.findByUserId(userId, limit);

  const response: ApiResponse = {
    success: true,
    data: alerts,
    message: `Retrieved ${alerts.length} alerts`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const markAlertAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const alertId = req.params.id;

  const success = await AlertModel.markAsRead(alertId, userId);
  if (!success) {
    throw new AppError('Alert not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Alert marked as read',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const deleteAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const alertId = req.params.id;

  const success = await AlertModel.delete(alertId, userId);
  if (!success) {
    throw new AppError('Alert not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Alert deleted successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const count = await AlertModel.getUnreadCount(userId);

  const response: ApiResponse = {
    success: true,
    data: { count },
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});