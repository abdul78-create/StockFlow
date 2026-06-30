import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import {
  adjustStockSchema,
  receiveStockSchema,
  dispatchStockSchema,
  transferStockSchema,
} from './inventory.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new InventoryController();

/**
 * @openapi
 * /api/v1/inventory/balances:
 *   get:
 *     summary: Retrieve stock balances
 *     description: List current stock volumes inside all warehouses belonging to the tenant.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock levels returned.
 */
router.get('/balances', authenticate, controller.getBalances);

/**
 * @openapi
 * /api/v1/inventory/history:
 *   get:
 *     summary: Get stock transaction history
 *     description: Retrieve historic inbound/outbound/adjustment movement transactions ledgers.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PURCHASE, SALE, RETURN, TRANSFER, ADJUSTMENT, DAMAGE, EXPIRED, OPENING_STOCK]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historical ledgers returned.
 */
router.get('/history', authenticate, controller.getHistory);

/**
 * @openapi
 * /api/v1/inventory/health:
 *   get:
 *     summary: Get stock health metrics
 *     description: Retrieve health score and values of inventory.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouseId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Health metrics returned.
 */
router.get('/health', authenticate, controller.getHealth);

/**
 * @openapi
 * /api/v1/inventory/adjust:
 *   post:
 *     summary: Manual stock adjustment
 *     description: Records a custom quantity adjustment (positive or negative) to align inventory records.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - warehouseId
 *               - quantityDelta
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *               quantityDelta:
 *                 type: integer
 *                 example: -2
 *               reason:
 *                 type: string
 *                 example: "Damaged box write-off"
 *     responses:
 *       200:
 *         description: Stock adjusted successfully.
 *       400:
 *         description: Underflow quantity exception.
 */
router.post(
  '/adjust',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: adjustStockSchema }),
  controller.adjust,
);

/**
 * @openapi
 * /api/v1/inventory/receive:
 *   post:
 *     summary: Receive stock from supplier
 *     description: Inbound stock addition from purchases.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - warehouseId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 example: 50
 *               reason:
 *                 type: string
 *                 example: "Purchase Order #8812"
 *     responses:
 *       200:
 *         description: Stock received successfully.
 */
router.post(
  '/receive',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: receiveStockSchema }),
  controller.receive,
);

/**
 * @openapi
 * /api/v1/inventory/dispatch:
 *   post:
 *     summary: Dispatch stock for sale
 *     description: Outbound stock extraction from sales orders.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - warehouseId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 example: 5
 *               reason:
 *                 type: string
 *                 example: "Customer invoice #892"
 *     responses:
 *       200:
 *         description: Stock dispatched successfully.
 */
router.post(
  '/dispatch',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: dispatchStockSchema }),
  controller.dispatch,
);

/**
 * @openapi
 * /api/v1/inventory/transfer:
 *   post:
 *     summary: Inter-warehouse transfer
 *     description: Transfer stock volumes between warehouses within the tenant organization.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - fromWarehouseId
 *               - toWarehouseId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               fromWarehouseId:
 *                 type: string
 *                 format: uuid
 *               toWarehouseId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               reason:
 *                 type: string
 *                 example: "HQ request replenishment"
 *     responses:
 *       200:
 *         description: Stock transferred successfully.
 */
router.post(
  '/transfer',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: transferStockSchema }),
  controller.transfer,
);

export default router;
