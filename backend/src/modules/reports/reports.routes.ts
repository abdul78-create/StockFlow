import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new ReportsController();

/**
 * @openapi
 * /api/v1/reports/inventory-valuation:
 *   get:
 *     summary: Get inventory valuation aggregates
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Category-wise valuation list.
 */
router.get('/inventory-valuation', authenticate, controller.getValuationReport);

/**
 * @openapi
 * /api/v1/reports/low-stock:
 *   get:
 *     summary: Get low stock product alerts
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of items below minimum thresholds.
 */
router.get('/low-stock', authenticate, controller.getLowStockReport);

/**
 * @openapi
 * /api/v1/reports/sales-summary:
 *   get:
 *     summary: Get sales performance summary
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sales counts and total values grouped by status.
 */
router.get('/sales-summary', authenticate, controller.getSalesReport);

export default router;
