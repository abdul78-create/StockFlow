import prisma from '../../infra/database/prisma';
import { ProductRepository, ProductFilters } from './product.repository';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { CreateProductInput, UpdateProductInput } from './product.validation';
import { Product } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';

export class ProductService {
  private productRepository: ProductRepository;

  constructor(productRepository = new ProductRepository()) {
    this.productRepository = productRepository;
  }

  async getProducts(
    organizationId: string,
    filters: ProductFilters,
  ): Promise<{ products: Product[]; total: number }> {
    return this.productRepository.findAll(organizationId, filters);
  }

  async getProductById(organizationId: string, id: string): Promise<Product> {
    const product = await this.productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  private async validateCategoryAndSupplier(
    organizationId: string,
    categoryId: string,
    supplierId?: string,
  ): Promise<void> {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundError('Category not found or does not belong to your organization');
    }

    if (supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: supplierId, organizationId, deletedAt: null },
      });
      if (!supplier) {
        throw new NotFoundError('Supplier not found or does not belong to your organization');
      }
    }
  }

  async createProduct(
    organizationId: string,
    userId: string,
    input: CreateProductInput,
  ): Promise<Product> {
    const existingProduct = await this.productRepository.findBySku(organizationId, input.sku);
    if (existingProduct) {
      throw new ConflictError(`Product SKU '${input.sku}' is already in use by another product`);
    }

    await this.validateCategoryAndSupplier(organizationId, input.categoryId, input.supplierId);

    const product = await this.productRepository.create(organizationId, input);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'PRODUCT_CREATED', 'Product', product.id, {
      sku: product.sku,
      name: product.name,
    });

    return product;
  }

  async updateProduct(
    organizationId: string,
    id: string,
    userId: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    const product = await this.productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (input.sku && input.sku !== product.sku) {
      const existingProduct = await this.productRepository.findBySku(organizationId, input.sku);
      if (existingProduct) {
        throw new ConflictError(`Product SKU '${input.sku}' is already in use by another product`);
      }
    }

    const categoryId = input.categoryId || product.categoryId;
    const supplierId = input.supplierId || product.supplierId || undefined;
    await this.validateCategoryAndSupplier(organizationId, categoryId, supplierId);

    const costPrice = input.costPrice !== undefined ? input.costPrice : Number(product.costPrice);
    const sellingPrice =
      input.sellingPrice !== undefined ? input.sellingPrice : Number(product.sellingPrice);
    if (sellingPrice < costPrice) {
      throw new ValidationError('Selling price cannot be less than cost price', [
        { field: 'sellingPrice', message: 'Selling price cannot be less than cost price' },
      ]);
    }

    const updated = await this.productRepository.update(organizationId, id, input);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'PRODUCT_UPDATED', 'Product', updated.id, {
      changes: input,
    });

    return updated;
  }

  async deleteProduct(organizationId: string, id: string, userId: string): Promise<void> {
    const product = await this.productRepository.findById(organizationId, id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await this.productRepository.softDelete(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'PRODUCT_DELETED', 'Product', id);
  }

  async restoreProduct(organizationId: string, id: string, userId: string): Promise<Product> {
    // We check using prisma directly for restoring since repository.findById filters out deleted items
    const product = await prisma.product.findFirst({
      where: { id, organizationId, status: 'ARCHIVED' },
    });
    if (!product) {
      throw new NotFoundError('Archived product not found');
    }

    const restored = await this.productRepository.restore(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, userId, 'PRODUCT_RESTORED', 'Product', id);

    return restored;
  }
}
