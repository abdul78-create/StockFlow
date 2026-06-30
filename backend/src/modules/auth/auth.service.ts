import bcrypt from 'bcryptjs';
import { AuthRepository } from './auth.repository';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error';
import { SignupInput, LoginInput } from './auth.validation';
import { User, Organization } from '@prisma/client';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository = new AuthRepository()) {
    this.authRepository = authRepository;
  }

  async signup(
    input: SignupInput,
  ): Promise<{ user: Omit<User, 'passwordHash'>; organization: Organization }> {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const { user, organization } = await this.authRepository.createUserWithOrganization(
      input.email,
      passwordHash,
      input.role,
      input.organizationName,
      input.firstName,
      input.lastName,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      organization,
    };
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'passwordHash'> }> {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
    };
  }

  async getProfile(email: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
