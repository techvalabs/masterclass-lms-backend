import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
    startTime?: number;
    user?: {
      id: number;
      email: string;
      name: string;
      role: string;
      roleId: number;
      permissions: string[];
      isVerified: boolean;
      isActive: boolean;
    };
  }
}