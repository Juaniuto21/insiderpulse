import { Router } from 'express';
import {
  createAlert,
  createAlertValidation,
  getUserAlerts,
  markAlertAsRead,
  deleteAlert,
  getUnreadCount
} from '@/controllers/alertController.js';
import { authenticate, requirePremium } from '@/middleware/auth.js';

const router = Router();

/**
 * @route POST /api/v1/alerts
 * @desc Create a new alert
 * @body ticker, alert_type, risk_level, title, description, expires_at
 * @access Private (Premium)
 */
router.post('/', authenticate, requirePremium, createAlertValidation, createAlert);

/**
 * @route GET /api/v1/alerts
 * @desc Get user's alerts
 * @query limit
 * @access Private
 */
router.get('/', authenticate, getUserAlerts);

/**
 * @route PUT /api/v1/alerts/:id/read
 * @desc Mark alert as read
 * @param id - Alert ID
 * @access Private
 */
router.put('/:id/read', authenticate, markAlertAsRead);

/**
 * @route DELETE /api/v1/alerts/:id
 * @desc Delete an alert
 * @param id - Alert ID
 * @access Private
 */
router.delete('/:id', authenticate, deleteAlert);

/**
 * @route GET /api/v1/alerts/unread/count
 * @desc Get unread alerts count
 * @access Private
 */
router.get('/unread/count', authenticate, getUnreadCount);

export default router;