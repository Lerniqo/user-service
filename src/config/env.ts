import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(process.env.DATABASE_URL);
export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5433/userservice',
  },
  secret: {
    key: process.env.SECRET_KEY || 'your-super-secret-key-change-this-in-production',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.GMAIL_USER || 'your-email@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password',
  },
  server: {
    port: parseInt(process.env.PORT || '4001'),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};
