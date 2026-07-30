import test from 'node:test'
import assert from 'node:assert/strict'
import {
  checkDateAvailability,
  getUnavailableDateKeys,
  listUnavailableDateKeys,
  parseAvailabilityMonth,
} from '../lib/services/availability'

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

test('listUnavailableDateKeys expands overlapping ranges without exposing booking data', () => {
  const result = listUnavailableDateKeys([
    {
      startDate: new Date('2026-08-10T12:00:00.000Z'),
      endDate: new Date('2026-08-12T12:00:00.000Z'),
    },
    {
      startDate: new Date('2026-08-12T12:00:00.000Z'),
      endDate: new Date('2026-08-13T12:00:00.000Z'),
    },
  ])

  assert.deepEqual(result, [
    '2026-08-10',
    '2026-08-11',
    '2026-08-12',
    '2026-08-13',
  ])
})

test('getUnavailableDateKeys combines blocked dates and active bookings in the requested range', async () => {
  const calls: Array<{ source: string; args: unknown }> = []
  const db = {
    blockedDate: {
      findMany: async (args: unknown) => {
        calls.push({ source: 'blockedDate', args })
        return [{
          startDate: new Date('2026-07-30T12:00:00.000Z'),
          endDate: new Date('2026-08-02T12:00:00.000Z'),
        }]
      },
    },
    booking: {
      findMany: async (args: unknown) => {
        calls.push({ source: 'booking', args })
        return [{
          startDate: new Date('2026-08-12T12:00:00.000Z'),
          endDate: new Date('2026-08-12T12:00:00.000Z'),
        }]
      },
    },
  } as unknown as Parameters<typeof getUnavailableDateKeys>[0]

  const result = await getUnavailableDateKeys(
    db,
    'property-1',
    new Date('2026-08-01T12:00:00.000Z'),
    new Date('2026-08-31T12:00:00.000Z')
  )

  assert.deepEqual(result, ['2026-08-01', '2026-08-02', '2026-08-12'])
  assert.equal(calls.length, 2)
  assert.match(JSON.stringify(calls), /PENDING/)
  assert.match(JSON.stringify(calls), /CONFIRMED/)
})

test('parseAvailabilityMonth accepts one valid calendar month only', () => {
  const range = parseAvailabilityMonth('2026-08')

  assert.equal(range?.from.toISOString(), '2026-08-01T12:00:00.000Z')
  assert.equal(range?.to.toISOString(), '2026-08-31T12:00:00.000Z')
  assert.equal(parseAvailabilityMonth('2026-13'), null)
  assert.equal(parseAvailabilityMonth('2026-8'), null)
  assert.equal(parseAvailabilityMonth('not-a-month'), null)
})
