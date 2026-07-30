import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveDatabaseEnv } from '../lib/database-env'

test('prefers explicit Prisma database variables', () => {
  assert.deepEqual(
    resolveDatabaseEnv({
      DATABASE_URL: 'postgresql://explicit-pooled',
      DIRECT_URL: 'postgresql://explicit-direct',
      POSTGRES_PRISMA_URL: 'postgresql://integration-pooled',
      POSTGRES_URL_NON_POOLING: 'postgresql://integration-direct',
    }),
    {
      databaseUrl: 'postgresql://explicit-pooled',
      directUrl: 'postgresql://explicit-direct',
    }
  )
})

test('falls back to Vercel Postgres integration variables', () => {
  assert.deepEqual(
    resolveDatabaseEnv({
      POSTGRES_PRISMA_URL: 'postgresql://integration-pooled',
      POSTGRES_URL_NON_POOLING: 'postgresql://integration-direct',
    }),
    {
      databaseUrl: 'postgresql://integration-pooled',
      directUrl: 'postgresql://integration-direct',
    }
  )
})
