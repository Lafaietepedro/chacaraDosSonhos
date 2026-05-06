#!/usr/bin/env node

const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const { spawnSync } = require('child_process')

const rootDir = process.cwd()
const schemaPath = 'prisma/schema-production.prisma'

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {}

  const env = {}
  const content = readFileSync(filePath, 'utf8')

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

const fileEnv = {
  ...parseEnvFile(join(rootDir, '.env')),
  ...parseEnvFile(join(rootDir, '.env.local')),
}

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/prisma-prod.js <prisma-command> [args]')
  process.exit(1)
}

const hasSchemaArg = args.some((arg) => arg === '--schema' || arg.startsWith('--schema='))
const prismaArgs = hasSchemaArg ? args : [...args, `--schema=${schemaPath}`]
const prismaBin = process.platform === 'win32'
  ? join(rootDir, 'node_modules', '.bin', 'prisma.cmd')
  : join(rootDir, 'node_modules', '.bin', 'prisma')

const result = spawnSync(prismaBin, prismaArgs, {
  cwd: rootDir,
  env: {
    ...fileEnv,
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
  },
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
