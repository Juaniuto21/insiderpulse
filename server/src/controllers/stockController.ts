import { Request, Response } from 'express';
import { param, body, validationResult } from 'express-validator';
import { geminiService } from '@/services/geminiService.js';
import { ApiResponse, StockData, WatchlistPriceData, MarketIndex } from '@/types/api.js';
import { asyncHandler, AppError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const getStockDataValidation = [
  param('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format')
];

export const getWatchlistPricesValidation = [
  body('tickers')
    .isArray({ min: 1, max: 50 })
    .withMessage('Tickers must be an array with 1-50 items'),
  body('tickers.*')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format')
];

export const getMarketIndicesValidation = [
  param('region')
    .isIn(['US', 'Europe', 'Asia', 'Cryptos'])
    .withMessage('Invalid region')
];

export const getStockData = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Invalid ticker format', 400);
  }

  const ticker = req.params.ticker.toUpperCase();
  
  logger.info('Fetching stock data', { 
    ticker, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const stockData = await geminiService.getStockData(ticker);

  if (!stockData) {
    throw new AppError(`Stock data not found for ticker: ${ticker}`, 404);
  }

  const response: ApiResponse<StockData> = {
    success: true,
    data: stockData,
    message: `Stock data retrieved for ${ticker}`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getWatchlistPrices = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Invalid tickers format', 400);
  }

  const tickers = req.body.tickers.map((t: string) => t.toUpperCase());
  
  logger.info('Fetching watchlist prices', { 
    tickers, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const prices = await geminiService.getWatchlistPrices(tickers);

  const response: ApiResponse<WatchlistPriceData[]> = {
    success: true,
    data: prices,
    message: `Retrieved prices for ${prices.length} tickers`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getMarketIndices = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Invalid region', 400);
  }

  const region = req.params.region as 'US' | 'Europe' | 'Asia' | 'Cryptos';
  
  logger.info('Fetching market indices', { 
    region, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const indices = await geminiService.getMarketIndices(region);

  const response: ApiResponse<MarketIndex[]> = {
    success: true,
    data: indices,
    message: `Retrieved ${indices.length} market indices for ${region}`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});