import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';

export class UserController {
  private userService: UserService;

  constructor(userService = new UserService()) {
    this.userService = userService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.user?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.user.organizationId, userId: req.user.id };
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const users = await this.userService.getUsers(orgId);
      ResponseFormatter.success(res, 200, 'Users retrieved successfully', users);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const user = await this.userService.getUserById(orgId, id);
      ResponseFormatter.success(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const newUser = await this.userService.createUser(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'User created successfully', newUser);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const updatedUser = await this.userService.updateUser(orgId, id, userId, req.body);
      ResponseFormatter.success(res, 200, 'User updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      await this.userService.deleteUser(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'User deleted successfully', null);
    } catch (error) {
      next(error);
    }
  };

  restoreUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const restored = await this.userService.restoreUser(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'User restored successfully', restored);
    } catch (error) {
      next(error);
    }
  };
}
