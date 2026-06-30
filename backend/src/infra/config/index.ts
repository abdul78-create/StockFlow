import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const configSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid connection URL' }),
  REDIS_URL: z.string().url({ message: 'REDIS_URL must be a valid connection URL' }).optional(),
  JWT_SECRET: z
    .string()
    .min(16, { message: 'JWT_SECRET must be at least 16 characters long for security' }),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

const result = configSchema.safeParse(process.env);

if (!result.success) {
  const errors = result.error.format();
  // eslint-disable-next-line no-console
  console.error('❌ Invalid Environment Configuration:');
  // eslint-disable-next-line no-console
  console.error(JSON.stringify(errors, null, 2));
  process.exit(1);
}

export const config = Object.freeze(result.data);
export type Config = typeof config;
