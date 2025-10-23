import { Request } from 'express';

export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  }

  static error(message: string, error?: any, data?: any) {
    console.error(`[ERROR] ${message}`, error, data ? JSON.stringify(data) : '');
  }

  static request(req: Request, message: string) {
    console.log(`[REQUEST] ${req.method} ${req.path} - ${message}`);
  }
}