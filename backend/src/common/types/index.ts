/* eslint-disable @typescript-eslint/no-namespace */
export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      id?: string; // Request Trace ID
    }
  }
}
