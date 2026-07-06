import { Router } from 'express';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { getAll, getById, create, updateStatus, convertToOrder } from './quotation.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('sales_orders.view'), getAll);
router.get('/:id', requirePermission('sales_orders.view'), getById);
router.post('/', requirePermission('sales_orders.create'), create);
router.put('/:id/status', requirePermission('sales_orders.update'), updateStatus);
router.post('/:id/convert', requirePermission('sales_orders.create'), convertToOrder);

export default router;
