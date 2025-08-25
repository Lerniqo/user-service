# Database Models Documentation

This document describes the database structure for the User Service, implemented using Prisma ORM.

## Overview

The database follows a normalized design with a central `users` table for authentication and role management, and separate profile tables for students and teachers. This approach provides:

- **Centralized authentication**: All users authenticate through a single table
- **Role-based access control**: Clear separation of user types
- **Flexible profiles**: Extensible profile information for different user types
- **Data integrity**: Proper foreign key relationships with cascade deletion

## Database Schema

### 1. Users Table (`users`)

The central table for storing core authentication and role information.

```sql
users (
  id: String (Primary Key, CUID)
  email: String (Unique)
  password_hash: String
  role: UserRole (Student | Teacher | Admin)
  created_at: DateTime
  updated_at: DateTime
  refresh_token: String? (Text)
  refresh_token_expires: DateTime?
  password_reset_token: String? (Unique)
  password_reset_expires: DateTime?
  is_verified: Boolean (Default: false)
  verification_token: String? (Unique)
)
```

**Key Features:**
- **CUID**: Collision-resistant unique identifier for better performance
- **Email uniqueness**: Ensures no duplicate email addresses
- **Role-based access**: Clear user type classification
- **Authentication support**: Refresh tokens, password reset, email verification
- **Audit trail**: Creation and modification timestamps

### 2. Student Profiles Table (`student_profiles`)

Stores profile information specific to students with a one-to-one relationship to the users table.

```sql
student_profiles (
  id: String (Primary Key, CUID)
  user_id: String (Foreign Key to users.id, Unique)
  full_name: String
  grade_level: String
  learning_goals: String? (Text)
  created_at: DateTime
  updated_at: DateTime
)
```

**Key Features:**
- **One-to-one relationship**: Each student has exactly one profile
- **Cascade deletion**: Profile is automatically deleted when user is deleted
- **Flexible goals**: Optional text field for learning objectives
- **Audit trail**: Creation and modification timestamps

### 3. Teacher Profiles Table (`teacher_profiles`)

Stores profile information specific to teachers with a one-to-one relationship to the users table.

```sql
teacher_profiles (
  id: String (Primary Key, CUID)
  user_id: String (Foreign Key to users.id, Unique)
  full_name: String
  qualifications: String? (Text)
  experience_summary: String? (Text)
  created_at: DateTime
  updated_at: DateTime
)
```

**Key Features:**
- **One-to-one relationship**: Each teacher has exactly one profile
- **Cascade deletion**: Profile is automatically deleted when user is deleted
- **Professional details**: Optional fields for qualifications and experience
- **Audit trail**: Creation and modification timestamps

## Relationships

```
User (1) ←→ (1) StudentProfile
User (1) ←→ (1) TeacherProfile
```

- Each user can have at most one profile (either student or teacher)
- Profile deletion is cascaded when the user is deleted
- Foreign key constraints ensure data integrity

## User Roles

The system supports three user roles:

- **Student**: Users with student profiles
- **Teacher**: Users with teacher profiles  
- **Admin**: Administrative users (no profile required)

## Usage Examples

### Creating a Student User

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create a student user with profile
const studentUser = await prisma.user.create({
  data: {
    email: 'student@example.com',
    passwordHash: 'hashedPassword123',
    role: 'Student',
    studentProfile: {
      create: {
        fullName: 'John Doe',
        gradeLevel: '10th Grade',
        learningGoals: 'Master Algebra and pass the term test'
      }
    }
  },
  include: {
    studentProfile: true
  }
})
```

### Creating a Teacher User

```typescript
// Create a teacher user with profile
const teacherUser = await prisma.user.create({
  data: {
    email: 'teacher@example.com',
    passwordHash: 'hashedPassword456',
    role: 'Teacher',
    teacherProfile: {
      create: {
        fullName: 'Jane Smith',
        qualifications: 'MSc in Mathematics, Teaching Certificate',
        experienceSummary: '5 years teaching high school mathematics'
      }
    }
  },
  include: {
    teacherProfile: true
  }
})
```

### Querying Users with Profiles

```typescript
// Get all students with their profiles
const students = await prisma.user.findMany({
  where: { role: 'Student' },
  include: { studentProfile: true }
})

// Get all teachers with their profiles
const teachers = await prisma.user.findMany({
  where: { role: 'Teacher' },
  include: { teacherProfile: true }
})

// Get a specific user with their profile
const user = await prisma.user.findUnique({
  where: { id: 'user_id_here' },
  include: {
    studentProfile: true,
    teacherProfile: true
  }
})
```

### Updating Profiles

```typescript
// Update student learning goals
await prisma.studentProfile.update({
  where: { userId: 'student_user_id' },
  data: {
    learningGoals: 'Master Calculus and prepare for college entrance exams'
  }
})

// Update teacher qualifications
await prisma.teacherProfile.update({
  where: { userId: 'teacher_user_id' },
  data: {
    qualifications: 'MSc in Mathematics, Teaching Certificate, PhD in Education'
  }
})
```

### Deleting Users

```typescript
// Delete a user (profiles are automatically deleted due to cascade)
await prisma.user.delete({
  where: { id: 'user_id_here' }
})
```

## Database Migrations

After updating the schema, generate and apply migrations:

```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migration to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

## Best Practices

1. **Always use transactions** when creating users with profiles to ensure data consistency
2. **Validate role consistency** - ensure profile type matches user role
3. **Use proper indexing** on frequently queried fields (email, role)
4. **Implement soft deletes** if you need to preserve user data
5. **Use environment variables** for database configuration
6. **Regular backups** of production data

## Security Considerations

- **Password hashing**: Always hash passwords before storing (use bcrypt or similar)
- **Input validation**: Validate all user inputs before database operations
- **SQL injection**: Prisma automatically prevents SQL injection
- **Access control**: Implement proper role-based access control in your application layer
- **Audit logging**: Log all user creation, modification, and deletion events
