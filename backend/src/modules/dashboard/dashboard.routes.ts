import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new DashboardController();

/**
 * @openapi
 * /api/v1/dashboard:
 *   get:
 *     summary: Retrieve aggregate dashboard metrics
 *     description: Returns totals, total stock valuations, low stock thresholds, and recent trace activity.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Metrics details aggregated.
 */
router.get('/', authenticate, controller.getMetrics);

export default router;
