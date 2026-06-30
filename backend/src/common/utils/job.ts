import logger from '../../infra/logger';

export class BackgroundJobProcessor {
  static run(taskName: string, task: () => Promise<void> | void): void {
    setImmediate(async () => {
      try {
        logger.info({ taskName }, `Asynchronous background job started`);
        await task();
        logger.info({ taskName }, `Asynchronous background job completed successfully`);
      } catch (error) {
        logger.error({ error, taskName }, `Asynchronous background job execution failed`);
      }
    });
  }
}
