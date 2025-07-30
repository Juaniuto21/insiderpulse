import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { geminiService } from '@/services/geminiService.js';
import { ApiResponse, AiAnalysisResult, AnalysisModuleType, CompanyProfile, SentimentAnalysisResult, BacktestResult } from '@/types/api.js';
import { asyncHandler, AppError } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const getAiAnalysisValidation = [
  body('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name is required'),
  body('analysisType')
    .isIn(Object.values(AnalysisModuleType))
    .withMessage('Invalid analysis type')
];

export const getSentimentAnalysisValidation = [
  body('ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
  body('name')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name is required')
];

export const runBacktestValidation = [
  body('scenario.id')
    .isLength({ min: 1, max: 50 })
    .withMessage('Scenario ID is required'),
  body('scenario.ticker')
    .isLength({ min: 1, max: 10 })
    .matches(/^[A-Z^.-]+$/)
    .withMessage('Invalid ticker format'),
  body('scenario.companyName')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name is required'),
  body('scenario.eventDescription')
    .isLength({ min: 10, max: 500 })
    .withMessage('Event description must be 10-500 characters'),
  body('scenario.eventDate')
    .isLength({ min: 1, max: 50 })
    .withMessage('Event date is required'),
  body('scenario.preEventDataSummary')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Pre-event data summary must be 50-2000 characters')
];

export const getRetirementAnalysisValidation = [
  body('currentAge')
    .isInt({ min: 18, max: 80 })
    .withMessage('Current age must be between 18 and 80'),
  body('retirementAge')
    .isInt({ min: 50, max: 100 })
    .withMessage('Retirement age must be between 50 and 100'),
  body('monthlyContribution')
    .isFloat({ min: 0, max: 50000 })
    .withMessage('Monthly contribution must be between 0 and 50000'),
  body('finalAmount')
    .isFloat({ min: 0 })
    .withMessage('Final amount must be a positive number')
];

export const getAiAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { ticker, name, analysisType } = req.body;
  const company: CompanyProfile = { ticker: ticker.toUpperCase(), name };
  
  logger.info('Fetching AI analysis', { 
    ticker: company.ticker,
    analysisType, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const analysis = await geminiService.getAiAnalysis(company, analysisType);

  const response: ApiResponse<AiAnalysisResult> = {
    success: true,
    data: analysis,
    message: `AI analysis completed for ${company.ticker}`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getSentimentAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { ticker, name } = req.body;
  const company: CompanyProfile = { ticker: ticker.toUpperCase(), name };
  
  logger.info('Fetching sentiment analysis', { 
    ticker: company.ticker, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const sentiment = await geminiService.getNewsAndSentimentAnalysis(company);

  const response: ApiResponse<SentimentAnalysisResult> = {
    success: true,
    data: sentiment,
    message: `Sentiment analysis completed for ${company.ticker}`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const runBacktest = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const { scenario } = req.body;
  
  logger.info('Running backtest analysis', { 
    scenarioId: scenario.id,
    ticker: scenario.ticker, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const result = await geminiService.runBacktestAnalysis(scenario);

  const response: ApiResponse<BacktestResult> = {
    success: true,
    data: result,
    message: `Backtest completed for scenario ${scenario.id}`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getRetirementAnalysis = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const inputs = req.body;
  
  logger.info('Fetching retirement analysis', { 
    inputs, 
    requestId: req.requestId,
    ip: req.ip 
  });

  const analysis = await geminiService.getRetirementAnalysis(inputs);

  const response: ApiResponse<string> = {
    success: true,
    data: analysis,
    message: 'Retirement analysis completed',
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});