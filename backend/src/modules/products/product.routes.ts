import { Router } from 'express';
import { ProductController } from './product.controller';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from './product.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new ProductController();

/**
 * @openapi
 * /api/v1/products:
 *   get:
 *     summary: Retrieve products list
 *     description: Returns a paginated list of active products belonging to the authenticated tenant organization.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter products by Category UUID.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, DRAFT, ARCHIVED]
 *         description: Filter products by status.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword matching SKU, name, or barcode.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Pagination page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Page sizes limit limit.
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *       401:
 *         description: Unauthorized. Invalid credentials cookie.
 */
router.get('/', authenticate, controller.getProducts);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get product details
 *     description: Retrieve detailed metadata for a single product. Checks tenant ownership boundaries.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the target product.
 *     responses:
 *       200:
 *         description: Product metadata retrieved.
 *       404:
 *         description: Product not found.
 */
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: productIdParamSchema }),
  controller.getProductById,
);

/**
 * @openapi
 * /api/v1/products:
 *   post:
 *     summary: Create new product
 *     description: Creates a new product profile. Requires Admin or Manager permission.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - costPrice
 *               - sellingPrice
 *               - categoryId
 *             properties:
 *               sku:
 *                 type: string
 *                 example: PROD-HEAD-004
 *               barcode:
 *                 type: string
 *                 example: 888999777112
 *               name:
 *                 type: string
 *                 example: Wireless Noise-Cancelling Headphones
 *               description:
 *                 type: string
 *                 example: Over-ear bluetooth headphones
 *               costPrice:
 *                 type: number
 *                 example: 120.00
 *               sellingPrice:
 *                 type: number
 *                 example: 199.99
 *               taxRate:
 *                 type: number
 *                 example: 18.00
 *               weight:
 *                 type: number
 *                 example: 0.35
 *               minimumStock:
 *                 type: integer
 *                 example: 10
 *               maximumStock:
 *                 type: integer
 *                 example: 200
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       400:
 *         description: Validation schema failed (e.g. selling price < cost price).
 *       409:
 *         description: SKU code conflict in tenant organization.
 */
router.post(
  '/',
  authenticate,
  requirePermission('products.create'),
  validateRequest({ body: createProductSchema }),
  controller.createProduct,
);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Modify product details
 *     description: Modifies metadata fields for an existing product.
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       404:
 *         description: Product not found.
 */
router.patch(
  '/:id',
  authenticate,
  requirePermission('products.update'),
  validateRequest({ params: productIdParamSchema, body: updateProductSchema }),
  controller.updateProduct,
);

/**
 * @openapi
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Delete a product (Soft Delete)
 *     description: Flags a product status as ARCHIVED and sets deletedAt timestamp. Scoped to Admin role.
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
 *         description: Product soft-deleted.
 *       404:
 *         description: Product not found.
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission('products.delete'),
  validateRequest({ params: productIdParamSchema }),
  controller.deleteProduct,
);

/**
 * @openapi
 * /api/v1/products/{id}/restore:
 *   post:
 *     summary: Restore a soft-deleted product
 *     description: Restores a soft-deleted product, resetting status back to ACTIVE. Scoped to Admin role.
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
 *         description: Product restored successfully.
 *       404:
 *         description: Product not found.
 */
router.post(
  '/:id/restore',
  authenticate,
  requirePermission('products.update'),
  validateRequest({ params: productIdParamSchema }),
  controller.restoreProduct,
);


router.post('/:id/variants', authenticate, requirePermission('products.update'), validateRequest({ params: productIdParamSchema }), controller.addVariant);
router.post('/:id/suppliers', authenticate, requirePermission('products.update'), validateRequest({ params: productIdParamSchema }), controller.addSupplier);
router.post('/:id/units', authenticate, requirePermission('products.update'), validateRequest({ params: productIdParamSchema }), controller.addUnit);
router.post('/:id/bundles', authenticate, requirePermission('products.update'), validateRequest({ params: productIdParamSchema }), controller.addBundleItem);
router.post('/:id/images', authenticate, requirePermission('products.update'), validateRequest({ params: productIdParamSchema }), controller.addImage);

export default router;
