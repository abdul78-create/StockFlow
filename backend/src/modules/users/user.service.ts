import bcrypt from 'bcryptjs';
import prisma from '../../infra/database/prisma';
import { UserRepository } from './user.repository';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { CreateUserInput, UpdateUserInput } from './user.validation';
import { User } from '@prisma/client';
import { AuditService } from '../../common/services/audit.service';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getUsers(organizationId: string): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.findAllByOrganization(organizationId);
    return users.map(({ passwordHash: _, ...user }) => user);
  }

  async getUserById(organizationId: string, id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(organizationId, id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(
    organizationId: string,
    performerId: string,
    input: CreateUserInput,
  ): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.userRepository.createUser(
      organizationId,
      input.email,
      passwordHash,
      input.role,
      input.firstName,
      input.lastName,
    );

    // Audit Log trigger
    await AuditService.log(organizationId, performerId, 'USER_CREATED', 'User', user.id, {
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    organizationId: string,
    id: string,
    performerId: string,
    input: UpdateUserInput,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(organizationId, id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.updateUser(organizationId, id, input);

    // Audit Log trigger
    await AuditService.log(organizationId, performerId, 'USER_UPDATED', 'User', updatedUser.id, {
      changes: input,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(organizationId: string, id: string, performerId: string): Promise<void> {
    const user = await this.userRepository.findById(organizationId, id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.softDeleteUser(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, performerId, 'USER_DELETED', 'User', id);
  }

  async restoreUser(
    organizationId: string,
    id: string,
    performerId: string,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await prisma.user.findFirst({
      where: { id, organizationId, deletedAt: { not: null } },
    });
    if (!user) {
      throw new NotFoundError('Archived user not found');
    }

    const restored = await this.userRepository.restoreUser(organizationId, id);

    // Audit Log trigger
    await AuditService.log(organizationId, performerId, 'USER_RESTORED', 'User', id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = restored;
    return userWithoutPassword;
  }
}
