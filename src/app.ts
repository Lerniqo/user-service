import express, { Request, Response, Express, NextFunction } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './api/routes/user.routes';
import usersRoutes from './api/routes/users.routes';
import cors from "cors";
import { config } from './config/env';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middlewares
app.use(express.json({ limit: '10mb' })); // To parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // To parse URL-encoded bodies
app.use(cookieParser()); // To parse cookies

app.use(
  cors({
    origin: [config.cors.frontendUrl, "http://localhost:3000"], // Allow requests from frontend
    credentials: true, // Allow cookies if needed
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('User Service is running!');
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes);  // Main users API

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: config.server.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app; 