import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { ResponseFormatter } from '../../common/responses';
import { UnauthorizedError } from '../../common/errors/app-error';

export class ProductController {
  private productService: ProductService;

  constructor(productService = new ProductService()) {
    this.productService = productService;
  }

  private getSessionContext(req: Request): { orgId: string; userId: string } {
    if (!req.workspace?.organizationId || !req.user?.id) {
      throw new UnauthorizedError('Tenant session context missing');
    }
    return { orgId: req.workspace.organizationId, userId: req.user.id };
  }

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { categoryId, status, search, page, limit } = req.query;

      const filters = {
        categoryId: categoryId as string,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      const result = await this.productService.getProducts(orgId, filters);
      ResponseFormatter.success(res, 200, 'Products retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const product = await this.productService.getProductById(orgId, id);
      ResponseFormatter.success(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const newProduct = await this.productService.createProduct(orgId, userId, req.body);
      ResponseFormatter.success(res, 201, 'Product created successfully', newProduct);
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const updatedProduct = await this.productService.updateProduct(orgId, id, userId, req.body);
      ResponseFormatter.success(res, 200, 'Product updated successfully', updatedProduct);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      await this.productService.deleteProduct(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'Product deleted successfully', null);
    } catch (error) {
      next(error);
    }
  };

  restoreProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId, userId } = this.getSessionContext(req);
      const { id } = req.params;
      const restored = await this.productService.restoreProduct(orgId, id, userId);
      ResponseFormatter.success(res, 200, 'Product restored successfully', restored);
    } catch (error) {
      next(error);
    }
  };

  addVariant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const variant = await this.productService.addVariant(orgId, id, req.body);
      ResponseFormatter.success(res, 201, 'Variant added', variant);
    } catch (error) {
      next(error);
    }
  };

  addSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const mapping = await this.productService.addSupplier(orgId, id, req.body);
      ResponseFormatter.success(res, 201, 'Supplier mapping added', mapping);
    } catch (error) {
      next(error);
    }
  };

  addUnit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orgId } = this.getSessionContext(req);
      const { id } = req.params;
      const unit = await this.productService.addUnit(orgId, id, req.body);
      ResponseFormatter.success(res, 201, 'Unit added', unit);
    } catch (error) {
      next(error);
    }
  };

}
