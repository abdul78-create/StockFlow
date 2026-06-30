import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  warehouseIdParamSchema,
} from './warehouse.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new WarehouseController();

/**
 * @openapi
 * /api/v1/warehouses:
 *   get:
 *     summary: Retrieve warehouses
 *     description: List paginated warehouses with searching.
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
router.get('/', authenticate, controller.getWarehouses);

/**
 * @openapi
 * /api/v1/warehouses/{id}:
 *   get:
 *     summary: Get warehouse details
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
 *         description: Warehouse details returned.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: warehouseIdParamSchema }),
  controller.getWarehouseById,
);

/**
 * @openapi
 * /api/v1/warehouses:
 *   post:
 *     summary: Create new warehouse
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Warehouse created.
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: createWarehouseSchema }),
  controller.createWarehouse,
);

/**
 * @openapi
 * /api/v1/warehouses/{id}:
 *   patch:
 *     summary: Update warehouse
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
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Warehouse updated.
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: warehouseIdParamSchema, body: updateWarehouseSchema }),
  controller.updateWarehouse,
);

export default router;
