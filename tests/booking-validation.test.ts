import test from 'node:test'
import assert from 'node:assert/strict'
import { bookingRequestSchema } from '../lib/validation/booking'

const validPayload = {
  date: '2026-06-12',
  guests: 80,
  packageId: 'celebracao',
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
})

test('bookingRequestSchema accepts numeric guest values as strings', () => {
  const parsed = bookingRequestSchema.parse({
    ...validPayload,
    guests: '120',
  })

  assert.equal(parsed.guests, 120)
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
