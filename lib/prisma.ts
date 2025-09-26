import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always initialize Prisma with SQLite
let client: PrismaClient | undefined

try {
  if (process.env.NODE_ENV !== 'production') {
    if (globalForPrisma.prisma) {
      client = globalForPrisma.prisma
    } else {
      client = new PrismaClient()
      globalForPrisma.prisma = client
    }
  } else {
    client = new PrismaClient()
  }
} catch (error) {
  console.warn('Prisma client initialization failed:', error)
  client = undefined
}

export const prisma = client
