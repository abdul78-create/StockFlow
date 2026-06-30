import { PrismaClient } from '@prisma/client';
import logger from '../logger';

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Hook up database events directly to our pino logger instance
prisma.$on('query', (e) => {
  logger.trace(
    { query: e.query, params: e.params, duration: `${e.duration}ms` },
    'Database Query Executed',
  );
});

prisma.$on('info', (e) => {
  logger.info(e.message);
});

prisma.$on('warn', (e) => {
  logger.warn(e.message);
});

prisma.$on('error', (e) => {
  logger.error(e.message);
});

export default prisma;
