import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address format' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
});

export const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid User ID format, must be a valid UUID' }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
