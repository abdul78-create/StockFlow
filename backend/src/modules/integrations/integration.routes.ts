import { Router } from 'express';
import { IntegrationController } from './integration.controller';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new IntegrationController();

router.use(authenticate);

/**
 * @openapi
 * /api/v1/integrations:
 *   get:
 *     summary: Get all integrations for the workspace
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved integrations.
 */
router.get('/', requirePermission('workspaces.view'), controller.getIntegrations);

/**
 * @openapi
 * /api/v1/integrations:
 *   post:
 *     summary: Setup a new integration
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *               category:
 *                 type: string
 *               config:
 *                 type: string
 *     responses:
 *       201:
 *         description: Integration setup successfully.
 */
router.post('/', requirePermission('workspaces.update'), controller.setupIntegration);

/**
 * @openapi
 * /api/v1/integrations/{provider}:
 *   put:
 *     summary: Update an integration
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               config:
 *                 type: string
 *     responses:
 *       200:
 *         description: Integration updated successfully.
 */
router.put('/:provider', requirePermission('workspaces.update'), controller.updateIntegration);

/**
 * @openapi
 * /api/v1/integrations/{provider}:
 *   delete:
 *     summary: Remove an integration
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Integration removed successfully.
 */
router.delete('/:provider', requirePermission('workspaces.update'), controller.removeIntegration);

export default router;
