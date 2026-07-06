import { Router } from 'express';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { getAll, getById, create, approve, cancel } from './sales-return.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('sales_orders.view'), getAll);
router.get('/:id', requirePermission('sales_orders.view'), getById);
router.post('/', requirePermission('sales_orders.create'), create);
router.put('/:id/approve', requirePermission('sales_orders.approve'), approve);
router.put('/:id/cancel', requirePermission('sales_orders.update'), cancel);

export default router;
