/* eslint-disable @typescript-eslint/no-namespace */
export interface TokenPayload {
  id: string;
  email: string;
  sessionId: string;
}

export interface WorkspacePayload {
  organizationId: string;
  role: string;
  membershipId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      workspace?: WorkspacePayload;
      id?: string; // Request Trace ID
    }
  }
}
