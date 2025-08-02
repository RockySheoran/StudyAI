import winston from 'winston';
import { TransformableInfo } from 'logform';

// Custom format that handles both simple strings and objects
const customFormat = winston.format.printf((info: TransformableInfo) => {
  const message = typeof info.message === 'object' 
    ? JSON.stringify(info.message, null, 2) 
    : info.message;
  
  return `${info.timestamp} [${info.level}]: ${message}${info.stack ? '\n' + info.stack : ''}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    // Only add file transport in production
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ]
});

// Add console.log-like behavior for simpler usage
logger.log = (message: any) => logger.info(message);
logger.debug = (message: any) => logger.debug(typeof message === 'object' ? JSON.stringify(message, null, 2) : message);

export default logger;