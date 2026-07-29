import test from 'node:test'
import assert from 'node:assert/strict'
import { checkRateLimit, clearRateLimit, getClientIp, rateLimitHeaders } from '../lib/rate-limit'

test('checkRateLimit allows requests until the configured limit is reached', () => {
  const key = `booking:test:${crypto.randomUUID()}`

  const first = checkRateLimit({ key, limit: 2, windowMs: 60_000 })
  const second = checkRateLimit({ key, limit: 2, windowMs: 60_000 })
  const third = checkRateLimit({ key, limit: 2, windowMs: 60_000 })

  assert.equal(first.allowed, true)
  assert.equal(first.remaining, 1)
  assert.equal(second.allowed, true)
  assert.equal(second.remaining, 0)
  assert.equal(third.allowed, false)
  assert.equal(third.remaining, 0)
})

test('checkRateLimit resets the bucket after the window expires', () => {
  const originalNow = Date.now
  const key = `contact:test:${crypto.randomUUID()}`

  try {
    Date.now = () => 1_000
    assert.equal(checkRateLimit({ key, limit: 1, windowMs: 500 }).allowed, true)
    assert.equal(checkRateLimit({ key, limit: 1, windowMs: 500 }).allowed, false)

    Date.now = () => 1_501
    const afterReset = checkRateLimit({ key, limit: 1, windowMs: 500 })
    assert.equal(afterReset.allowed, true)
    assert.equal(afterReset.remaining, 0)
  } finally {
    Date.now = originalNow
  }
})

test('clearRateLimit releases a bucket after a successful action', () => {
  const key = `admin-login:test:${crypto.randomUUID()}`

  assert.equal(checkRateLimit({ key, limit: 1, windowMs: 60_000 }).allowed, true)
  assert.equal(checkRateLimit({ key, limit: 1, windowMs: 60_000 }).allowed, false)

  clearRateLimit(key)

  assert.equal(checkRateLimit({ key, limit: 1, windowMs: 60_000 }).allowed, true)
})

test('getClientIp prefers the first forwarded IP and falls back to x-real-ip', () => {
  const forwardedRequest = new Request('https://venue.test', {
    headers: {
      'x-forwarded-for': '203.0.113.10, 198.51.100.20',
      'x-real-ip': '198.51.100.30',
    },
  })

  const realIpRequest = new Request('https://venue.test', {
    headers: {
      'x-real-ip': '198.51.100.30',
    },
  })

  assert.equal(getClientIp(forwardedRequest), '203.0.113.10')
  assert.equal(getClientIp(realIpRequest), '198.51.100.30')
})

test('rateLimitHeaders serializes remaining attempts and reset time', () => {
  assert.deepEqual(rateLimitHeaders({ remaining: 3, resetAt: 12_345 }), {
    'X-RateLimit-Remaining': '3',
    'X-RateLimit-Reset': '13',
  })
})
