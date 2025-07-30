import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { WatchlistModel } from '@/models/Watchlist.js';
import { geminiService } from '@/services/geminiService.js';
import { ApiResponse } from '@/types/api.js';
import { asyncHandler, AppError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const addToWatchlistValidation = [
  body('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name is required')
];

export const addToWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.userId;
  const { ticker, name } = req.body;

  // Check if user has reached watchlist limit (e.g., 50 items)
  const currentCount = await WatchlistModel.count(userId);
  if (currentCount >= 50) {
    throw new AppError('Watchlist limit reached (50 items)', 400);
  }

  const item = await WatchlistModel.add(userId, ticker.toUpperCase(), name);

  logger.info('Item added to watchlist', {
    userId,
    ticker,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    data: item,
    message: 'Item added to watchlist',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.status(201).json(response);
});

export const removeFromWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const ticker = req.params.ticker.toUpperCase();

  const success = await WatchlistModel.remove(userId, ticker);
  if (!success) {
    throw new AppError('Item not found in watchlist', 404);
  }

  logger.info('Item removed from watchlist', {
    userId,
    ticker,
    requestId: req.requestId
  });

  const response: ApiResponse = {
    success: true,
    message: 'Item removed from watchlist',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getUserWatchlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const items = await WatchlistModel.findByUserId(userId);

  const response: ApiResponse = {
    success: true,
    data: items,
    message: `Retrieved ${items.length} watchlist items`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getWatchlistWithPrices = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const items = await WatchlistModel.findByUserId(userId);

  if (items.length === 0) {
    const response: ApiResponse = {
      success: true,
      data: [],
      message: 'Watchlist is empty',
      timestamp: new Date().toISOString(),
      requestId: req.requestId
    };
    return res.json(response);
  }

  // Get current prices for all tickers
  const tickers = items.map(item => item.ticker);
  const prices = await geminiService.getWatchlistPrices(tickers);

  // Combine watchlist items with prices
  const watchlistWithPrices = items.map(item => {
    const priceData = prices.find(p => p.ticker === item.ticker);
    return {
      ...item,
      price: priceData?.price || null,
      change: priceData?.change || null,
      changePercent: priceData?.changePercent || null
    };
  });

  const response: ApiResponse = {
    success: true,
    data: watchlistWithPrices,
    message: `Retrieved ${items.length} watchlist items with prices`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});