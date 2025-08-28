import express, { Request, Response, Express, NextFunction } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './api/routes/user.routes';
import usersRoutes from './api/routes/users.routes';
import cors from "cors";
import { config } from './config/env';
import { log } from './config/logger';
import { requestLogger, errorLogger } from './api/middlewares/logging.middleware';

// Load environment variables
dotenv.config();

const app: Express = express();

// Log application startup
log.info('User Service starting up', {
  nodeEnv: config.server.nodeEnv,
  port: config.server.port,
  nodeVersion: process.version
});

// Request logging middleware (should be early in the middleware stack)
app.use(requestLogger);

// Middlewares
app.use(express.json({ limit: '10mb' })); // To parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // To parse URL-encoded bodies
app.use(cookieParser()); // To parse cookies



app.use(
  cors({
    // origin: [config.cors.frontendUrl, "http://localhost:3000","https://main.d1sth71y2qgz43.amplifyapp.com"], // Allow requests from frontend
    origin: (origin, callback) => {
      const allowedOrigins = [
        config.cors.frontendUrl,
        "http://localhost:3000",
        "https://main.d1sth71y2qgz43.amplifyapp.com"
      ];

      if (allowedOrigins.includes(origin) || !origin) {
        return callback(null, true);
      }

      log.security("CORS request blocked", { origin });
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true, // Allow cookies if needed
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  log.debug('Root endpoint accessed');
  res.send('User Service is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthData = { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  log.debug('Health check accessed', healthData);
  res.status(200).json(healthData);
});

// API Routes
app.use('/user', userRoutes);
app.use('/users', usersRoutes);  // Main users API

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error logging middleware (should be before error handling)
app.use(errorLogger);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  log.error('Unhandled error in application', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  log.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  res.status(404).json({ message: 'Route not found' });
});

export default app; 