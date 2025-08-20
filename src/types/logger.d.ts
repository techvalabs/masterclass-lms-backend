import winston from 'winston';

declare module 'winston' {
  interface Logger {
    upload: (filename: string, size: number) => void;
    request: (req: any, res: any, duration: number) => void;
    security: (message: string, metadata?: any) => void;
    email: (message: string, to: string, subject: string) => void;
  }
}