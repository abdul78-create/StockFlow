import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './category.validation';

export class CategoryController {
  private categoryService: CategoryService;

  constructor(categoryService = new CategoryService()) {
    this.categoryService = categoryService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const categories = await this.categoryService.getCategories(orgId);
      ResponseFormatter.success(res, 200, 'Categories retrieved', categories);
    } catch (error) {
      next(error);
    }
  };

  getCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = categoryIdParamSchema.parse(req.params);
      const category = await this.categoryService.getCategory(id, orgId);
      ResponseFormatter.success(res, 200, 'Category retrieved', category);
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const data = createCategorySchema.parse(req.body);
      const category = await this.categoryService.createCategory(orgId, data);
      ResponseFormatter.success(res, 201, 'Category created', category);
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = categoryIdParamSchema.parse(req.params);
      const data = updateCategorySchema.parse(req.body);
      const category = await this.categoryService.updateCategory(id, orgId, data);
      ResponseFormatter.success(res, 200, 'Category updated', category);
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = categoryIdParamSchema.parse(req.params);
      await this.categoryService.deleteCategory(id, orgId);
      ResponseFormatter.success(res, 200, 'Category deleted', null);
    } catch (error) {
      next(error);
    }
  };
}
