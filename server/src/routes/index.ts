import { Router } from 'express';
import newsRoutes from './newsRoutes.js';
import stockRoutes from './stockRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import contentRoutes from './contentRoutes.js';
import { config } from '@/config/environment.js';

const router = Router();

// API version prefix
const apiPrefix = `/api/${config.apiVersion}`;

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'InsiderPulse API is running',
    version: config.apiVersion,
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Mount route modules
router.use(`${apiPrefix}/news`, newsRoutes);
router.use(`${apiPrefix}/stocks`, stockRoutes);
router.use(`${apiPrefix}/analysis`, analysisRoutes);
router.use(`${apiPrefix}/content`, contentRoutes);

export default router;