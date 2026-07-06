import { Router } from 'express';
import { CycleCountController } from './cycle-count.controller';
import {
  createCycleCountSchema,
  updateCycleCountItemSchema,
  cycleCountIdParamSchema,
  itemIdParamSchema,
} from './cycle-count.validation';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';

const router = Router();
const controller = new CycleCountController();

router.get('/', authenticate, controller.getAll);
router.post(
  '/',
  authenticate,
  requirePermission('inventory.adjust'),
  validateRequest({ body: createCycleCountSchema }),
  controller.create
);

router.get('/:id', authenticate, validateRequest({ params: cycleCountIdParamSchema }), controller.getById);

router.patch(
  '/:id/items/:itemId',
  authenticate,
  requirePermission('inventory.adjust'),
  validateRequest({ params: itemIdParamSchema, body: updateCycleCountItemSchema }),
  controller.updateItem
);

router.post(
  '/:id/complete',
  authenticate,
  requirePermission('inventory.adjust'),
  validateRequest({ params: cycleCountIdParamSchema }),
  controller.complete
);

export default router;
