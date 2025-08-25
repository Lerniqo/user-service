# User Service

A clean and modern user management service built with Node.js, Express, TypeScript, and Prisma. Provides authentication, user profile management, and role-based access control for students, teachers, and administrators.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Docker & Docker Compose

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Start database
docker compose -f docker-compose.dev.yml up -d postgresql

# 3. Setup database
npx prisma migrate dev
npx prisma generate

# 4. Run the service
npm run dev
```

🎉 Service runs at `http://localhost:4001`

## 📋 Features

- **Authentication**: Registration, login, email verification, password reset
- **Role-based Access**: Student, Teacher, and Admin roles
- **Profile Management**: Complete user profile management
- **Security**: Session-based authentication with encrypted tokens
- **File Upload**: Profile photo upload
- **Email Integration**: Automated verification and password reset emails

## 🛠 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom session codes
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: express-validator
- **Security**: bcryptjs password hashing

## 🔧 Development

```bash
npm run dev     # Development with hot reload
npm run build   # Build for production
npm start       # Run production build
```

## 📚 API Endpoints

### Core Routes
- **POST** `/api/users/register` - Register new user
- **POST** `/api/users/login` - User login  
- **POST** `/api/users/verify-email` - Email verification
- **GET** `/api/users/me` - Get current user profile
- **PUT** `/api/users/me` - Update profile
- **POST** `/api/users/logout` - Logout
- **GET** `/api/users/teachers` - List all teachers (public)
- **GET** `/api/users/teachers/:id` - Get teacher profile (public)

### Additional Routes
- **PUT** `/api/user/change-password` - Change password
- **POST** `/api/user/upload-photo` - Upload profile photo

## 🗄 Database Schema

Four-table architecture for clean separation:
- **Users**: Core authentication and common fields
- **Students**: Student-specific data (gradeLevel, learningGoals)  
- **Teachers**: Teacher-specific data (qualifications, experienceSummary)
- **Admins**: Admin-specific data (department)

## 🔒 Security

- Session-based authentication with encrypted tokens
- Password hashing with bcryptjs
- Input validation and sanitization
- Role-based access control
- Secure file upload handling

## 📝 Environment Variables

Create a `.env` file:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/userservice"
SECRET_KEY="your-secret-key"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"  
SMTP_PASS="your-app-password"
PORT=4001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```