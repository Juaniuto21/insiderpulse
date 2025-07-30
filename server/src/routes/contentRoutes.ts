import { Router } from 'express';
import { getFinancialVideos, getLiveMarketEvents } from '@/controllers/contentController.js';

const router = Router();

/**
 * @route GET /api/v1/content/videos
 * @desc Get curated financial videos
 * @access Public
 */
router.get('/videos', getFinancialVideos);

/**
 * @route GET /api/v1/content/events
 * @desc Get live market events
 * @access Public
 */
router.get('/events', getLiveMarketEvents);

export default router;