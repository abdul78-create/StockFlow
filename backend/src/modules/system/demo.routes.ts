import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth.middleware';
import { seedDemo } from './demo.controller';

const router = Router();

/**
 * POST /api/v1/demo/seed
 * Seeds realistic demo data for the authenticated organization.
 * Requires: authenticated, OWNER role, DEMO_MODE=true env var.
 */
router.post('/seed', authenticate, seedDemo);

export default router;
