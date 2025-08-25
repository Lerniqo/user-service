#!/bin/bash

echo "🚀 Starting User Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Check if PostgreSQL is running
echo "🗄️  Checking database connection..."
if ! pg_isready -h localhost -p 5433 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running on port 5433."
    echo "   Starting PostgreSQL with Docker..."
    docker-compose -f docker-compose.dev.yml up -d postgresql
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 10
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
pnpm prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
pnpm prisma migrate dev --name init

# Start the development server
echo "🚀 Starting development server..."
pnpm dev
