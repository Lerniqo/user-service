# User Service

A comprehensive user management service built with Node.js, Express, TypeScript, and Prisma. This service provides authentication, user profile management, and role-based access control for students, teachers, and administrators.

## ✅ Project Status: FULLY RUNNABLE

This project has been successfully configured and is ready to run immediately!

## 🚀 Quick Start (Ready to Run!)

### Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose

### 1-Minute Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd user-service
   npm install
   ```

2. **Start Database**
   ```bash
   docker compose -f docker-compose.dev.yml up -d postgresql
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

🎉 **That's it!** The service will be running at `http://localhost:4001`

The application is pre-configured with:
- ✅ Database schema and migrations
- ✅ Environment configuration  
- ✅ All dependencies installed
- ✅ TypeScript compilation working
- ✅ All API endpoints functional

## 📋 Features

- **User Authentication**: Registration, login, email verification, password reset
- **Role-based Access Control**: Support for Student, Teacher, and Admin roles
- **Profile Management**: Complete profile management for all user types
- **Email Integration**: Automated email verification and password reset
- **Security**: JWT tokens with refresh token support, password hashing
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: Profile photo upload functionality

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js 4.x, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing
- **Development**: Nodemon for hot reloading
- **Containerization**: Docker & Docker Compose

## 🔧 Development Mode

For development with hot reloading:

```bash
npm run dev
```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /verify-email` - Verify email address
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /refresh-token` - Refresh JWT token
- `POST /logout` - Logout user

### User Profile (`/api/user`)
- `PUT /update-profile` - Update user profile
- `PUT /change-password` - Change user password
- `POST /upload-photo` - Upload profile photo

### Student (`/api/student`)
- `GET /profile` - Get student profile
- `PUT /update-academic` - Update academic details
- `GET /all` - Get all students (Admin only)
- `GET /grade/:gradeLevel` - Get students by grade level

### Teacher (`/api/teacher`)
- `GET /profile` - Get teacher profile
- `PUT /update-professional` - Update professional details
- `GET /all` - Get all teachers (Admin only)
- `GET /search/:qualification` - Search teachers by qualification

### Admin (`/api/admin`)
- `GET /profile` - Get admin profile
- `PUT /update-administrative` - Update administrative details
- `GET /all` - Get all admins
- `GET /statistics` - Get system statistics
- `GET /users/:role` - Get users by role

## 🗄 Database Schema

The service uses a unified User model with role-based differentiation:

```prisma
model User {
  id                     String    @id @default(cuid())
  email                  String    @unique
  password               String
  role                   UserRole  @default(Student)
  fullName               String
  
  // Student-specific fields
  gradeLevel             Int?
  learningGoals          String?
  
  // Teacher-specific fields
  qualifications         String?
  experienceSummary      String?
  
  // Common fields
  isActive               Boolean   @default(true)
  isVerified             Boolean   @default(false)
  profileImage           String?
  verificationCode       String?
  passwordResetCode      String?
  passwordResetExpires   DateTime?
  refreshTokens          String[]
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}

enum UserRole {
  Student
  Teacher
  Admin
}
```

## 🧪 Testing

Test the API using the provided Postman collection:
`User_Service_Auth.postman_collection.json`

Example user registration:
```bash
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User",
    "role": "Student",
    "gradeLevel": 10
  }'
```

## 🐳 Docker Deployment

For production deployment:

```bash
docker compose up -d
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Access and refresh token system
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **CORS Configuration**: Configurable CORS settings
- **Environment Variables**: Secure configuration management

## 📝 Environment Configuration

The `.env` file is pre-configured with development settings. For production, update:

```env
# Security Keys (CHANGE THESE!)
SECRET_KEY="your-production-secret-key"
JWT_SECRET="your-production-jwt-secret"
JWT_REFRESH_SECRET="your-production-jwt-refresh-secret"

# Email Configuration
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"
```

## 🎯 Recent Fixes Applied

- ✅ Fixed TypeScript type compatibility issues
- ✅ Updated controllers for unified User model
- ✅ Fixed authentication middleware
- ✅ Corrected API routing configuration
- ✅ Resolved Express version compatibility
- ✅ Updated Prisma schema and migrations
- ✅ Cleaned up unused legacy code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to use!** 🎉 The service is fully functional and all endpoints are working correctly.