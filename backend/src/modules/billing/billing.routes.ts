import { Router } from 'express';
import { BillingController } from './billing.controller';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new BillingController();

/**
 * @openapi
 * /api/v1/billing/subscription:
 *   get:
 *     summary: Get current subscription
 *     security:
 *       - cookieAuth: []
 */
router.get('/subscription', authenticate, requirePermission('workspaces.view'), controller.getSubscription);

/**
 * @openapi
 * /api/v1/billing/subscribe:
 *   post:
 *     summary: Upgrade subscription plan
 *     security:
 *       - cookieAuth: []
 */
router.post('/subscribe', authenticate, requirePermission('workspaces.update'), controller.upgradeSubscription);

export default router;
