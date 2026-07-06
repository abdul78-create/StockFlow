import app from './app';
import { config } from './infra/config';
import logger from './infra/logger';
import prisma from './infra/database/prisma';
import { CronService } from './modules/automation/cron.service';

const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to the database successfully');

    app.listen(config.PORT, () => {
      logger.info(`Server is running in ${config.NODE_ENV} mode on port ${config.PORT}`);
      CronService.initialize();
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
