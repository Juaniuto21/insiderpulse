import { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { geminiService } from '@/services/geminiService.js';
import { ApiResponse, FinancialNewsArticle } from '@/types/api.js';
import { asyncHandler, AppError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const getFinancialNewsValidation = [
  query('category')
    .optional()
    .isIn(['Mercados', 'Tecnología', 'Economía', 'Cripto', 'Opinión', 'Global', 'Todo'])
    .withMessage('Invalid category')
];

export const getFinancialNews = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const category = req.query.category as FinancialNewsArticle['category'] | 'Todo' || 'Todo';
  
  logger.info('Fetching financial news', { 
    category, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const news = await geminiService.getFinancialNews(category);

  const response: ApiResponse<FinancialNewsArticle[]> = {
    success: true,
    data: news,
    message: `Retrieved ${news.length} news articles`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getInitialDashboard = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Fetching initial dashboard data', { 
    requestId: req.requestId,
    ip: req.ip 
  });

  const dashboardData = await geminiService.getInitialDashboardData();

  const response: ApiResponse = {
    success: true,
    data: dashboardData,
    message: 'Initial dashboard data retrieved successfully',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});