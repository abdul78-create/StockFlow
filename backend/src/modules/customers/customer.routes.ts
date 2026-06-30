import { Router } from 'express';
import { CustomerController } from './customer.controller';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from './customer.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new CustomerController();

/**
 * @openapi
 * /api/v1/customers:
 *   get:
 *     summary: Retrieve customers list
 *     description: Returns a paginated list of active customers.
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
 *         description: Customers list retrieved.
 */
router.get('/', authenticate, controller.getCustomers);

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get Customer details
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
 *         description: Customer details returned.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: customerIdParamSchema }),
  controller.getCustomerById,
);

/**
 * @openapi
 * /api/v1/customers:
 *   post:
 *     summary: Create new customer
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
 *                 example: Acme Retail Corporation
 *               email:
 *                 type: string
 *                 example: contact@acmeretail.com
 *               phone:
 *                 type: string
 *                 example: "+1-555-9080"
 *               gst:
 *                 type: string
 *                 example: "GSTIN99281ABC"
 *               address:
 *                 type: string
 *                 example: "12 Logistics Dr, Houston, TX"
 *     responses:
 *       201:
 *         description: Customer created successfully.
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ body: createCustomerSchema }),
  controller.createCustomer,
);

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   patch:
 *     summary: Update customer details
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
 *     responses:
 *       200:
 *         description: Customer details updated.
 */
router.patch(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'MANAGER']),
  validateRequest({ params: customerIdParamSchema, body: updateCustomerSchema }),
  controller.updateCustomer,
);

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Delete a customer (Soft Delete)
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
 *         description: Customer soft-deleted.
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateRequest({ params: customerIdParamSchema }),
  controller.deleteCustomer,
);

/**
 * @openapi
 * /api/v1/customers/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted customer
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
 *         description: Customer restored.
 */
router.post(
  '/:id/restore',
  authenticate,
  authorize(['ADMIN']),
  validateRequest({ params: customerIdParamSchema }),
  controller.restoreCustomer,
);

export default router;
