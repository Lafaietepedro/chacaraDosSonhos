#!/bin/bash

# Build script for Vercel deployment
# This script handles the database setup for production

echo "🚀 Starting build process..."

# Check if we're in production
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Production build detected"
  
  # Check if DATABASE_URL is set
  if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, using fallback configuration"
    # Copy production schema to main schema
    cp prisma/schema-production.prisma prisma/schema.prisma
  else
    echo "✅ DATABASE_URL found, using PostgreSQL"
    # Copy production schema to main schema
    cp prisma/schema-production.prisma prisma/schema.prisma
  fi
else
  echo "🔧 Development build detected"
  # Keep the original SQLite schema
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Run the build
echo "🏗️  Running Next.js build..."
npm run build

echo "✅ Build completed successfully!"
