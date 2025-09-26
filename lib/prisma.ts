import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always initialize Prisma with SQLite
let client: PrismaClient | undefined

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

export const prisma = client
