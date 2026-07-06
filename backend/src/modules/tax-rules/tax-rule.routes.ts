import { Router } from 'express';
import { authenticate, requirePermission } from '../../common/middleware/auth.middleware';
import { getTaxRules, getTaxRule, createTaxRule, updateTaxRule, deleteTaxRule } from './tax-rule.controller';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('workspaces.view'), getTaxRules);
router.get('/:id', requirePermission('workspaces.view'), getTaxRule);
router.post('/', requirePermission('workspaces.update'), createTaxRule);
router.put('/:id', requirePermission('workspaces.update'), updateTaxRule);
router.delete('/:id', requirePermission('workspaces.update'), deleteTaxRule);

export default router;
