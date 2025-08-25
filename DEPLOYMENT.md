# Production Deployment Guide

## Environment Variables for Production

When deploying to production with an external PostgreSQL database, you need to set the following environment variables:

### Required Variables

```bash
# External Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@your-database-host:5432/your-database-name

# Authentication Secret (REQUIRED - CHANGE THIS!)
SECRET_KEY=your-super-secure-secret-key-for-jwt-tokens

# Email Configuration (REQUIRED for user verification/password reset)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

### Optional Variables (with defaults)

```bash
# Server Configuration
PORT=4001
NODE_ENV=production

# Email SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Options

### Option 1: Using Docker Compose (Recommended)

1. Create a `.env` file with your production values:
```bash
DATABASE_URL=postgresql://user:pass@external-db-host:5432/dbname
SECRET_KEY=your-secure-secret-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=https://your-domain.com
```

2. Deploy:
```bash
docker-compose up -d
```

### Option 2: Direct Docker Run

```bash
docker run -d \
  -p 4001:4001 \
  -e DATABASE_URL="postgresql://user:pass@external-db:5432/dbname" \
  -e SECRET_KEY="your-secure-secret-key" \
  -e SMTP_USER="your-email@gmail.com" \
  -e SMTP_PASS="your-app-password" \
  -e FRONTEND_URL="https://your-domain.com" \
  --name user-service-prod \
  user-service

```

### Option 3: Cloud Deployment (AWS ECS, Google Cloud Run, etc.)

Set environment variables in your cloud platform's configuration:
- DATABASE_URL
- SECRET_KEY  
- SMTP_USER
- SMTP_PASS
- FRONTEND_URL
- PORT (if different from 4001)

## Database Setup

Before deployment, ensure your external PostgreSQL database is ready:

1. Create the database
2. Run Prisma migrations:
```bash
npx prisma migrate deploy
```

## Health Check

The service includes a health check endpoint at `/health` that verifies the service is running.

## Security Notes

- Never commit real environment variables to version control
- Use strong, unique SECRET_KEY values
- Use app-specific passwords for email (not your main password)
- Ensure your database uses SSL in production
- Regularly rotate secrets and passwords
