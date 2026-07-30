#!/bin/bash

echo "Starting build process..."

if [ "$NODE_ENV" = "production" ]; then
  echo "Production build detected"

  export DATABASE_URL="${DATABASE_URL:-$POSTGRES_PRISMA_URL}"
  export DIRECT_URL="${DIRECT_URL:-$POSTGRES_URL_NON_POOLING}"

  if [ -n "$BACKEND_BASE_URL" ]; then
    echo "Backend proxy configured; database access will remain in the origin deployment"
  elif [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL or POSTGRES_PRISMA_URL must be configured for production builds"
    exit 1
  elif [ -z "$DIRECT_URL" ]; then
    echo "DIRECT_URL or POSTGRES_URL_NON_POOLING must be configured for Prisma production schema"
    exit 1
  else
    echo "DATABASE_URL and DIRECT_URL found, using PostgreSQL"
  fi

  PRISMA_SCHEMA="prisma/schema-production.prisma"
else
  echo "Development build detected"
  PRISMA_SCHEMA="prisma/schema.prisma"
fi

echo "Generating Prisma client..."
./node_modules/.bin/prisma generate --schema="$PRISMA_SCHEMA"

echo "Running Next.js build..."
./node_modules/.bin/next build

echo "Build completed successfully!"
