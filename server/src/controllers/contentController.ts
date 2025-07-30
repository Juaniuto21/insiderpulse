import { Request, Response } from 'express';
import { geminiService } from '@/services/geminiService.js';
import { ApiResponse, FinancialVideo, LiveEventCategory } from '@/types/api.js';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { logger } from '@/config/logger.js';

export const getFinancialVideos = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Fetching financial videos', { 
    requestId: req.requestId,
    ip: req.ip 
  });

  const videos = await geminiService.getFinancialVideos();

  const response: ApiResponse<FinancialVideo[]> = {
    success: true,
    data: videos,
    message: `Retrieved ${videos.length} financial videos`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});

export const getLiveMarketEvents = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Fetching live market events', { 
    requestId: req.requestId,
    ip: req.ip 
  });

  const events = await geminiService.getLiveMarketEvents();

  const response: ApiResponse<LiveEventCategory[]> = {
    success: true,
    data: events,
    message: `Retrieved ${events.length} event categories`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  };

  res.json(response);
});