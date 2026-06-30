import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown | null;
  timestamp: string;
}

export class ResponseFormatter {
  static success<T>(res: Response, statusCode: number, message: string, data: T): Response {
    const responseBody: ApiResponse<T> = {
      success: true,
      message,
      data,
      errors: null,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(responseBody);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors: unknown = null,
  ): Response {
    const responseBody: ApiResponse<null> = {
      success: false,
      message,
      data: null,
      errors,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(responseBody);
  }
}
