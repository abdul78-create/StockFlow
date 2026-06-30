import { Router } from 'express';
import { SalesOrderController } from './sales-order.controller';
import {
  createSOSchema,
  updateSOStatusSchema,
  dispatchSOSchema,
  soIdParamSchema,
} from './sales-order.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new SalesOrderController();

/**
 * @openapi
 * /api/v1/sales-orders:
 *   get:
 *     summary: Retrieve sales orders list
 *     description: List paginated sales orders.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, APPROVED, PACKED, DISPATCHED, DELIVERED, CANCELLED]
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
router.get('/', authenticate, controller.getSalesOrders);

/**
 * @openapi
 * /api/v1/sales-orders/{id}:
 *   get:
 *     summary: Get Sales Order details
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
 *         description: Details returned.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: soIdParamSchema }),
  controller.getSalesOrderById,
);

/**
 * @openapi
 * /api/v1/sales-orders:
 *   post:
 *     summary: Create draft Sales Order
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - soNumber
 *               - customerId
 *               - items
 *             properties:
 *               soNumber:
 *                 type: string
 *                 example: SO-2026-001
 *               customerId:
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
 *                       example: 5
 *                     unitPrice:
 *                       type: number
 *                       example: 119.99
 *     responses:
 *       201:
 *         description: Sales Order created.
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: createSOSchema }),
  controller.createSalesOrder,
);

/**
 * @openapi
 * /api/v1/sales-orders/{id}/status:
 *   patch:
 *     summary: Transition Sales Order status & reserve stock
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
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *                 description: Required to allocate and reserve stock when status is PENDING or APPROVED
 *     responses:
 *       200:
 *         description: Status changed and reservation processed.
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: soIdParamSchema, body: updateSOStatusSchema }),
  controller.updateStatus,
);

/**
 * @openapi
 * /api/v1/sales-orders/{id}/dispatch:
 *   post:
 *     summary: Dispatch sales order
 *     description: Deducts physical stocks and allocations, logging a SALE ledger transaction.
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
 *             properties:
 *               warehouseId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Dispatch recorded.
 */
router.post(
  '/:id/dispatch',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: soIdParamSchema, body: dispatchSOSchema }),
  controller.dispatchOrder,
);

export default router;
