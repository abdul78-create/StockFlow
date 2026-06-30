import { Router } from 'express';
import { PurchaseOrderController } from './purchase-order.controller';
import {
  createPOSchema,
  updatePOStatusSchema,
  receiveGoodsSchema,
  poIdParamSchema,
} from './purchase-order.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new PurchaseOrderController();

/**
 * @openapi
 * /api/v1/purchase-orders:
 *   get:
 *     summary: Retrieve purchase orders
 *     description: List paginated purchase orders with searching and filtering.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, COMPLETED, CANCELLED]
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
 *         description: List returned.
 */
router.get('/', authenticate, controller.getPurchaseOrders);

/**
 * @openapi
 * /api/v1/purchase-orders/{id}:
 *   get:
 *     summary: Get Purchase Order details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details returned.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: poIdParamSchema }),
  controller.getPurchaseOrderById,
);

/**
 * @openapi
 * /api/v1/purchase-orders:
 *   post:
 *     summary: Create new purchase order (Draft)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poNumber
 *               - supplierId
 *               - items
 *             properties:
 *               poNumber:
 *                 type: string
 *                 example: PO-2026-002
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *                     unitPrice:
 *                       type: number
 *                       example: 25.50
 *     responses:
 *       201:
 *         description: PO created as DRAFT.
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: createPOSchema }),
  controller.createPurchaseOrder,
);

/**
 * @openapi
 * /api/v1/purchase-orders/{id}/status:
 *   patch:
 *     summary: Update Purchase Order status
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, APPROVED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated.
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: poIdParamSchema, body: updatePOStatusSchema }),
  controller.updateStatus,
);

/**
 * @openapi
 * /api/v1/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive items (Goods Receipt)
 *     description: Increments warehouse inventory balances and logs stock transaction ledger.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouseId
 *               - items
 *             properties:
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       example: 50
 *     responses:
 *       200:
 *         description: Goods received and stock quantities modified.
 */
router.post(
  '/:id/receive',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: poIdParamSchema, body: receiveGoodsSchema }),
  controller.receiveGoods,
);

export default router;
