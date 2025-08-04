import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './api/routes/auth.routes';
import userRoutes from './api/routes/user.routes';
import studentRoutes from './api/routes/student.routes';
import teacherRoutes from './api/routes/teacher.routes';
import adminRoutes from './api/routes/admin.routes';
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(express.json()); // To parse JSON bodies

// app.use(
//   cors({
//     origin: "http://localhost:3000", // Allow requests from frontend
//     credentials: true, // Allow cookies if needed
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   })
// );

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('User Service is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));


export default app; 