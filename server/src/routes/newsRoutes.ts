import { Router } from 'express';
import { getFinancialNews, getFinancialNewsValidation, getInitialDashboard } from '@/controllers/newsController.js';

const router = Router();

/**
 * @route GET /api/v1/news
 * @desc Get financial news articles
 * @query category - Optional category filter
 * @access Public
 */
router.get('/', getFinancialNewsValidation, getFinancialNews);

/**
 * @route GET /api/v1/news/dashboard
 * @desc Get initial dashboard data (news, alerts, indices)
 * @access Public
 */
router.get('/dashboard', getInitialDashboard);

export default router;