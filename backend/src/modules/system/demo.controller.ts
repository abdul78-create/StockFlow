import { Request, Response, NextFunction } from 'express';
import { DemoSeedService } from './demo.service';
import { ResponseFormatter } from '../../common/responses';
import { ForbiddenError } from '../../common/errors/app-error';

const demoSeedService = new DemoSeedService();

export const seedDemo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Guard: only available in demo mode
    if (process.env.DEMO_MODE !== 'true') {
      throw new ForbiddenError('Demo mode is not enabled on this server.');
    }

    const orgId = req.workspace?.organizationId;
    if (!orgId) {
      throw new ForbiddenError('Organization context required.');
    }

    // Guard: only OWNER role can seed
    const role = req.workspace?.role;
    if (role !== 'OWNER') {
      throw new ForbiddenError('Only organization owners can seed demo data.');
    }

    const result = await demoSeedService.seed(orgId);
    ResponseFormatter.success(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
};
