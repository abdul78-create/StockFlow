import { Router } from 'express';
import { AutomationController } from './automation.controller';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new AutomationController();

/**
 * @openapi
 * /api/v1/automation/trigger/overdue-invoices:
 *   post:
 *     summary: Manually trigger the check for overdue invoices
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully triggered the check.
 */
router.post('/trigger/overdue-invoices', authenticate, requirePermission('workspaces.update'), controller.triggerOverdueInvoices);

/**
 * @openapi
 * /api/v1/automation/trigger/subscriptions:
 *   post:
 *     summary: Manually trigger the check for expired subscriptions
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully triggered the check.
 */
router.post('/trigger/subscriptions', authenticate, requirePermission('workspaces.update'), controller.triggerSubscriptionsCheck);

export default router;
