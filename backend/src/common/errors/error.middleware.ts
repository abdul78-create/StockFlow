import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from './app-error';
import { ResponseFormatter } from '../responses';
import logger from '../../infra/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : null;
    logger.warn(
      {
        requestId: req.id,
        err: { message: err.message, statusCode: err.statusCode },
        url: req.url,
      },
      'Operational error caught',
    );
    ResponseFormatter.error(res, err.statusCode, err.message, errors);
    return;
  }

  // Unhandled / system errors
  logger.error({ requestId: req.id, err, url: req.url, method: req.method }, 'Unhandled Exception');

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something unexpected happened. Our team has been notified.'
      : err.message;
  ResponseFormatter.error(res, 500, message);
};
