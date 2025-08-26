import { Request, Response, NextFunction } from 'express';
import { log } from '../../config/logger';

export interface LoggedRequest extends Request {
  startTime?: number;
}

// HTTP request logging middleware
export const requestLogger = (req: LoggedRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();

  // Log the incoming request
  log.http('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString()
  });

  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void): Response {
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;
    
    // Log the response
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 500) {
      log.error('HTTP Response - Server Error', undefined, logData);
    } else if (res.statusCode >= 400) {
      log.warn('HTTP Response - Client Error', logData);
    } else {
      log.http('HTTP Response - Success', logData);
    }

    // Performance warning for slow requests
    if (responseTime > 1000) {
      log.performance('Slow Request', responseTime, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode
      });
    }

    // Call the original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  };

  log.error('Unhandled Application Error', err, errorInfo);
  next(err);
};
