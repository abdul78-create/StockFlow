import { CategoryRepository } from './category.repository';
import { CreateCategoryInput, UpdateCategoryInput } from './category.validation';
import { NotFoundError } from '../../common/errors/app-error';

const repository = new CategoryRepository();

export class CategoryService {
  async getCategories(organizationId: string) {
    return repository.findMany(organizationId);
  }

  async getCategory(id: string, organizationId: string) {
    const category = await repository.findById(id, organizationId);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async createCategory(organizationId: string, data: CreateCategoryInput) {
    return repository.create(organizationId, data);
  }

  async updateCategory(id: string, organizationId: string, data: UpdateCategoryInput) {
    const category = await this.getCategory(id, organizationId);
    return repository.update(category.id, organizationId, data);
  }

  async deleteCategory(id: string, organizationId: string) {
    const category = await this.getCategory(id, organizationId);
    return repository.delete(category.id, organizationId);
  }
}
