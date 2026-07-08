import app from './app';
import { config } from './infra/config';
import logger from './infra/logger';
import prisma from './infra/database/prisma';
import { CronService } from './modules/automation/cron.service';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to the database successfully');

    const server = app.listen(config.PORT, () => {
      logger.info(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      CronService.initialize();
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err: Error) => {
      logger.error({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
