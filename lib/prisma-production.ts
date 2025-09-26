// Prisma configuration for production (Vercel)
// This file helps with build issues on Vercel

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let client: PrismaClient | undefined

// In production, we need to handle database connection more carefully
if (process.env.NODE_ENV === 'production') {
  // For Vercel, we'll use PostgreSQL if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      client = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      })
    } catch (error) {
      console.warn('Failed to initialize Prisma with DATABASE_URL:', error)
      client = undefined
    }
  } else {
    console.warn('DATABASE_URL not found in production environment')
    client = undefined
  }
} else {
  // Development - use SQLite
  try {
    if (globalForPrisma.prisma) {
      client = globalForPrisma.prisma
    } else {
      client = new PrismaClient()
      globalForPrisma.prisma = client
    }
  } catch (error) {
    console.warn('Prisma client initialization failed in development:', error)
    client = undefined
  }
}

export const prisma = client
