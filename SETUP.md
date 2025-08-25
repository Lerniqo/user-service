# User Service Setup Guide

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start.sh
```

### Option 2: Manual setup

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Docker)
- pnpm (will be installed automatically if missing)

## 🗄️ Database Setup

### Using Docker (Recommended)
```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgresql

# Wait for PostgreSQL to be ready
sleep 10
```

### Using local PostgreSQL
- Install PostgreSQL
- Create a database named `userservice`
- Update the `DATABASE_URL` in your environment

## 🔧 Installation

1. **Install dependencies**
```bash
pnpm install
```

2. **Set up environment variables**
Create a `.env` file with:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/userservice"
SECRET_KEY="your-super-secret-key-change-this-in-production"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
PORT=4001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

3. **Generate Prisma client**
```bash
pnpm prisma generate
```

4. **Run database migrations**
```bash
pnpm prisma migrate dev --name init
```

## 🚀 Running the Service

### Development mode
```bash
pnpm dev
```

### Production mode
```bash
pnpm build
pnpm start
```

## 🔐 Authentication

The service now uses **secret codes** instead of JWT tokens:

- **Login**: Returns a `sessionCode` that should be included in the `Authorization` header
- **Session Code**: Valid for 24 hours, automatically expires
- **No database storage**: Codes are encrypted and self-contained

### Example API usage:
```bash
# Login
curl -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use session code
curl -X GET http://localhost:4001/api/auth/profile \
  -H "Authorization: Bearer <session_code>"
```

## 🧪 Testing

Test the authentication endpoints:
```bash
# Test file included
node test-auth.js
```

## 📁 Project Structure

```
src/
├── api/
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Authentication & validation
│   └── routes/          # API endpoints
├── config/              # Configuration files
├── services/            # Business logic
└── types/               # TypeScript definitions
```

## 🔧 Troubleshooting

### Common Issues:

1. **Database connection failed**
   - Check if PostgreSQL is running
   - Verify `DATABASE_URL` in environment
   - Ensure database exists

2. **Prisma client not generated**
   - Run `pnpm prisma generate`
   - Check if schema.prisma is valid

3. **Port already in use**
   - Change `PORT` in environment
   - Kill existing process on port 4001

### Reset Database:
```bash
pnpm prisma migrate reset
pnpm prisma migrate dev --name init
```

## 📚 API Documentation

- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/verify-email` - Email verification
- **GET** `/api/auth/profile` - Get user profile
- **POST** `/api/auth/logout` - User logout
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password

## 🌟 Features

- ✅ Secret code authentication (no JWT)
- ✅ Role-based access control (Student, Teacher, Admin)
- ✅ Email verification
- ✅ Password reset
- ✅ Profile management
- ✅ File uploads
- ✅ Comprehensive validation
- ✅ TypeScript support
- ✅ Prisma ORM
- ✅ Docker support
