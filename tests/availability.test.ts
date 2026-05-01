import test from 'node:test'
import assert from 'node:assert/strict'
import { checkDateAvailability } from '../lib/services/availability'

type AvailabilityDb = Parameters<typeof checkDateAvailability>[0]

function createDb({
  blockedDate = null,
  booking = null,
}: {
  blockedDate?: unknown
  booking?: unknown
}): AvailabilityDb {
  return {
    blockedDate: {
      findFirst: async () => blockedDate,
    },
    booking: {
      findFirst: async () => booking,
    },
  } as unknown as AvailabilityDb
}

test('checkDateAvailability blocks dates registered as unavailable', async () => {
  const result = await checkDateAvailability(
    createDb({ blockedDate: { id: 'blocked-date' } }),
    'property-1',
    new Date('2026-06-10T12:00:00.000Z')
  )

  assert.deepEqual(result, { available: false, reason: 'date_blocked' })
})

test('checkDateAvailability blocks dates with pending or confirmed bookings', async () => {
  const result = await checkDateAvailability(
    createDb({ booking: { id: 'booking-1' } }),
    'property-1',
    new Date('2026-06-10T12:00:00.000Z')
  )

  assert.deepEqual(result, { available: false, reason: 'already_booked' })
})

test('checkDateAvailability allows dates without blocks or active bookings', async () => {
  const result = await checkDateAvailability(
    createDb({}),
    'property-1',
    new Date('2026-06-10T12:00:00.000Z')
  )

  assert.deepEqual(result, { available: true })
})
