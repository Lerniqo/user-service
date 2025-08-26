import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from './env';

// Define colors for different log levels
const colors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m'   // Reset
};

// Custom format for console output with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const color = colors[level as keyof typeof colors] || colors.reset;
    const levelUpperCase = level.toUpperCase();
    
    let logMessage = `${color}[${timestamp}] ${levelUpperCase}:${colors.reset} ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${color}Meta:${colors.reset} ${JSON.stringify(meta, null, 2)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      logMessage += `\n${colors.error}Stack:${colors.reset} ${stack}`;
    }
    
    return logMessage;
  })
);

// JSON format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: config.server.nodeEnv === 'development' ? 'debug' : 'info',
  format: fileFormat,
  defaultMeta: { service: 'user-service' },
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: config.server.nodeEnv === 'development' ? consoleFormat : fileFormat,
      handleExceptions: true,
      handleRejections: true
    }),

    // Error log file
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      handleExceptions: true,
      handleRejections: true
    }),

    // Combined log file
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d'
    }),

    // Access log for HTTP requests
    new DailyRotateFile({
      filename: 'logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ],
  
  // Exit on error
  exitOnError: false,
});

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Winston already has these log levels by default:
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6

// Helper methods for structured logging
export const log = {
  error: (message: string, error?: Error | unknown, meta?: object) => {
    const errorMeta = error instanceof Error 
      ? { error: error.message, stack: error.stack, ...meta }
      : { error, ...meta };
    logger.error(message, errorMeta);
  },

  warn: (message: string, meta?: object) => {
    logger.warn(message, meta);
  },

  info: (message: string, meta?: object) => {
    logger.info(message, meta);
  },

  debug: (message: string, meta?: object) => {
    logger.debug(message, meta);
  },

  http: (message: string, meta?: object) => {
    logger.log('http', message, meta);
  },

  // Request logging helper
  request: (req: any, res?: any, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      ...(responseTime && { responseTime: `${responseTime}ms` }),
      ...(res && { statusCode: res.statusCode }),
      ...(req.user && { userId: req.user.id })
    };

    if (res && res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.log('http', 'HTTP Request', logData);
    }
  },

  // Database operation logging
  database: (operation: string, table?: string, duration?: number, meta?: object) => {
    logger.debug('Database Operation', {
      operation,
      table,
      ...(duration && { duration: `${duration}ms` }),
      ...meta
    });
  },

  // Security logging
  security: (event: string, meta?: object) => {
    logger.warn('Security Event', { event, ...meta });
  },

  // Performance logging
  performance: (operation: string, duration: number, meta?: object) => {
    const level = duration > 1000 ? 'warn' : 'info';
    logger.log(level, 'Performance', {
      operation,
      duration: `${duration}ms`,
      ...meta
    });
  }
};

export default logger;
