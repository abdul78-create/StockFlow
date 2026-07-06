import { Router } from 'express';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { getAll, getById, create, approve, cancel } from './purchase-return.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('purchase_orders.view'), getAll);
router.get('/:id', requirePermission('purchase_orders.view'), getById);
router.post('/', requirePermission('purchase_orders.create'), create);
router.put('/:id/approve', requirePermission('purchase_orders.approve'), approve);
router.put('/:id/cancel', requirePermission('purchase_orders.update'), cancel);

export default router;
