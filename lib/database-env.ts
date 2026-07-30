type DatabaseEnvironment = Record<string, string | undefined>

export function resolveDatabaseEnv(env: DatabaseEnvironment) {
  return {
    databaseUrl: env.DATABASE_URL || env.POSTGRES_PRISMA_URL,
    directUrl: env.DIRECT_URL || env.POSTGRES_URL_NON_POOLING,
  }
}
