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

  private async validateCategory(
    organizationId: string,
    categoryId: string,
  ): Promise<void> {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundError('Category not found or does not belong to your organization');
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

    await this.validateCategory(organizationId, input.categoryId);

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
    await this.validateCategory(organizationId, categoryId);

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

  // New Methods for Products 2.0
  async addVariant(organizationId: string, productId: string, data: any) {
    const product = await this.getProductById(organizationId, productId);
    return prisma.productVariant.create({
      data: {
        productId: product.id,
        name: data.name,
        sku: data.sku,
        barcode: data.barcode,
        price: data.price,
        cost: data.cost,
      }
    });
  }

  async addSupplier(organizationId: string, productId: string, data: any) {
    const product = await this.getProductById(organizationId, productId);
    return prisma.productSupplier.create({
      data: {
        productId: product.id,
        supplierId: data.supplierId,
        supplierSku: data.supplierSku,
        supplierPrice: data.supplierPrice,
        leadTimeDays: data.leadTimeDays,
        isDefault: data.isDefault,
      }
    });
  }

  async addUnit(organizationId: string, productId: string, data: any) {
    const product = await this.getProductById(organizationId, productId);
    return prisma.productUnit.create({
      data: {
        productId: product.id,
        name: data.name,
        conversionRatio: data.conversionRatio,
        barcode: data.barcode,
      }
    });
  }

  async addBundleItem(organizationId: string, productId: string, data: any) {
    const product = await this.getProductById(organizationId, productId);
    // Ensure the product is marked as a bundle
    if (!product.isBundle) {
      await prisma.product.update({ where: { id: product.id }, data: { isBundle: true } });
    }
    
    // Verify component exists
    const component = await this.getProductById(organizationId, data.componentProductId);
    
    return prisma.productBundleItem.create({
      data: {
        bundleProductId: product.id,
        componentProductId: component.id,
        quantity: data.quantity,
      }
    });
  }

  async addImage(organizationId: string, productId: string, data: any) {
    const product = await this.getProductById(organizationId, productId);
    
    if (data.isPrimary) {
      // Unset previous primary image
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data: { isPrimary: false },
      });
      // Also update main imageUrl on product
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: data.url },
      });
    }

    return prisma.productImage.create({
      data: {
        productId: product.id,
        url: data.url,
        isPrimary: data.isPrimary,
      }
    });
  }

}
