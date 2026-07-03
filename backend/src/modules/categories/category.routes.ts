import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './category.validation';

const router = Router();
const controller = new CategoryController();

router.get(
  '/',
  authenticate,
  requirePermission('products.view'),
  controller.getCategories
);

router.get(
  '/:id',
  authenticate,
  requirePermission('products.view'),
  validateRequest({ params: categoryIdParamSchema }),
  controller.getCategory
);

router.post(
  '/',
  authenticate,
  requirePermission('products.create'),
  validateRequest({ body: createCategorySchema }),
  controller.createCategory
);

router.patch(
  '/:id',
  authenticate,
  requirePermission('products.update'),
  validateRequest({ params: categoryIdParamSchema, body: updateCategorySchema }),
  controller.updateCategory
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('products.delete'),
  validateRequest({ params: categoryIdParamSchema }),
  controller.deleteCategory
);

export default router;
