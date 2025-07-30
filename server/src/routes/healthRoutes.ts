import { Router } from 'express';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { geminiService } from '@/services/geminiService.js';
import { cacheService } from '@/services/cacheService.js';
import { config } from '@/config/environment.js';
import { logger } from '@/config/logger.js';

const router = Router();

/**
 * @route GET /health
 * @desc Basic health check
 * @access Public
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InsiderPulse API is running',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    uptime: process.uptime()
  });
});

/**
 * @route GET /health/detailed
 * @desc Detailed health check with service status
 * @access Public
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check Gemini service
  const geminiHealthy = await geminiService.healthCheck();
  const geminiStats = geminiService.getStats();
  
  // Check cache service
  const cacheStats = cacheService.getStats();
  
  // Memory usage
  const memoryUsage = process.memoryUsage();
  
  // System info
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    pid: process.pid
  };
  
  const healthData = {
    status: geminiHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: config.apiVersion,
    environment: config.nodeEnv,
    responseTime: Date.now() - startTime,
    services: {
      gemini: {
        status: geminiHealthy ? 'up' : 'down',
        stats: geminiStats
      },
      cache: {
        status: 'up',
        stats: cacheStats
      }
    },
    system: systemInfo,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
    }
  };
  
  const statusCode = geminiHealthy ? 200 : 503;
  
  logger.info('Health check performed', {
    status: healthData.status,
    responseTime: healthData.responseTime,
    geminiHealthy,
    requestId: req.requestId
  });
  
  res.status(statusCode).json({
    success: geminiHealthy,
    data: healthData,
    timestamp: new Date().toISOString(),
    requestId: req.requestId
  });
}));

/**
 * @route GET /health/ready
 * @desc Readiness probe for Kubernetes
 * @access Public
 */
router.get('/ready', asyncHandler(async (req, res) => {
  const geminiHealthy = await geminiService.healthCheck();
  
  if (geminiHealthy) {
    res.status(200).json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @route GET /health/live
 * @desc Liveness probe for Kubernetes
 * @access Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;