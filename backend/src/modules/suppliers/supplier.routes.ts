import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierIdParamSchema,
} from './supplier.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new SupplierController();

/**
 * @openapi
 * /api/v1/suppliers:
 *   get:
 *     summary: Retrieve suppliers
 *     description: List paginated suppliers with searching.
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
router.get('/', authenticate, controller.getSuppliers);

/**
 * @openapi
 * /api/v1/suppliers/{id}:
 *   get:
 *     summary: Get supplier details
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
 *         description: Supplier details returned.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: supplierIdParamSchema }),
  controller.getSupplierById,
);

/**
 * @openapi
 * /api/v1/suppliers/{id}/stats:
 *   get:
 *     summary: Get supplier stats
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
 *         description: Supplier stats returned.
 */
router.get(
  '/:id/stats',
  authenticate,
  validateRequest({ params: supplierIdParamSchema }),
  controller.getSupplierStats,
);

/**
 * @openapi
 * /api/v1/suppliers:
 *   post:
 *     summary: Create new supplier
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *             properties:
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created.
 */
router.post(
  '/',
  authenticate,
  requirePermission('suppliers.create'),
  validateRequest({ body: createSupplierSchema }),
  controller.createSupplier,
);

/**
 * @openapi
 * /api/v1/suppliers/{id}:
 *   patch:
 *     summary: Update supplier
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
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supplier updated.
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission('suppliers.update'),
  validateRequest({ params: supplierIdParamSchema, body: updateSupplierSchema }),
  controller.updateSupplier,
);

export default router;
