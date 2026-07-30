import test from 'node:test'
import assert from 'node:assert/strict'
import { bookingRequestSchema, isBookableLocalDate } from '../lib/validation/booking'

const validPayload = {
  date: '2027-06-12',
  guests: 80,
  packageId: 'celebracao',
  expectedTotal: 10900,
  customer: {
    name: 'Cliente Teste',
    email: 'CLIENTE@EXEMPLO.COM',
    phone: ' 5561999999999 ',
    notes: 'Precisa de mesas extras',
  },
}

test('bookingRequestSchema normalizes valid booking payloads', () => {
  const parsed = bookingRequestSchema.parse(validPayload)

  assert.equal(parsed.customer.email, 'cliente@exemplo.com')
  assert.equal(parsed.customer.phone, '5561999999999')
  assert.equal(parsed.guests, 80)
  assert.equal(parsed.expectedTotal, 10900)
})

test('bookingRequestSchema accepts numeric guest values as strings', () => {
  const parsed = bookingRequestSchema.parse({
    ...validPayload,
    guests: '120',
  })

  assert.equal(parsed.guests, 120)
})

test('bookingRequestSchema accepts selected add-ons with quantities', () => {
  const parsed = bookingRequestSchema.parse({
    ...validPayload,
    addons: [
      { id: 'addon-1', quantity: '2' },
    ],
  })

  assert.deepEqual(parsed.addons, [
    { id: 'addon-1', quantity: 2 },
  ])
})

test('bookingRequestSchema rejects invalid expected totals', () => {
  const result = bookingRequestSchema.safeParse({
    ...validPayload,
    expectedTotal: -1,
  })

  assert.equal(result.success, false)
})

test('bookingRequestSchema accepts structured custom package notes', () => {
  const parsed = bookingRequestSchema.parse({
    ...validPayload,
    customer: {
      ...validPayload.customer,
      notes: '[Pacote sob medida]\nTipo de evento: Corporativo\nNecessidades principais: briefing detalhado',
    },
  })

  assert.match(parsed.customer.notes ?? '', /Pacote sob medida/)
})

test('bookingRequestSchema rejects invalid dates, guests and customer email', () => {
  const result = bookingRequestSchema.safeParse({
    ...validPayload,
    date: '2026-02-31',
    guests: 0,
    customer: {
      ...validPayload.customer,
      email: 'email-invalido',
    },
  })

  assert.equal(result.success, false)
})

test('isBookableLocalDate rejects past dates in the business timezone', () => {
  const now = new Date('2026-07-30T15:00:00.000Z')

  assert.equal(isBookableLocalDate('2026-07-29', now), false)
  assert.equal(isBookableLocalDate('2026-07-30', now), true)
  assert.equal(isBookableLocalDate('2026-07-31', now), true)
  assert.equal(isBookableLocalDate('2026-02-31', now), false)
})
