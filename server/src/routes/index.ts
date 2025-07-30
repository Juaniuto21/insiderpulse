import { Router } from 'express';
import newsRoutes from './newsRoutes.js';
import stockRoutes from './stockRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import contentRoutes from './contentRoutes.js';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import alertRoutes from './alertRoutes.js';
import watchlistRoutes from './watchlistRoutes.js';
import { config } from '@/config/environment.js';

const router = Router();

// API version prefix
const apiPrefix = `/api/${config.apiVersion}`;

// Health check routes
router.use('/health', healthRoutes);

// Mount route modules
router.use(`${apiPrefix}/news`, newsRoutes);
router.use(`${apiPrefix}/stocks`, stockRoutes);
router.use(`${apiPrefix}/analysis`, analysisRoutes);
router.use(`${apiPrefix}/content`, contentRoutes);
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/alerts`, alertRoutes);
router.use(`${apiPrefix}/watchlist`, watchlistRoutes);

export default router;