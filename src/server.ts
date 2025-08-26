import app from './app';
import { config } from './config/env';
import { log } from './config/logger';

const PORT: number = config.server.port;

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error: Error) => {
  log.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  log.error('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
    promise: promise.toString()
  });
  process.exit(1);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const server = app.listen(PORT, () => {
  log.info('User Service started successfully', {
    port: PORT,
    environment: config.server.nodeEnv,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
}).on('error', (error) => {
  log.error('Server failed to start', error, {
    port: PORT,
    environment: config.server.nodeEnv
  });
  process.exit(1);
});

export default server; 