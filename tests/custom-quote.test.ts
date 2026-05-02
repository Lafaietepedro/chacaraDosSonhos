import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCustomQuoteDraft } from '../lib/services/custom-quote.service'

test('buildCustomQuoteDraft creates line items for custom bookings', () => {
  const draft = buildCustomQuoteDraft({
    notes: [
      '[Pacote sob medida]',
      'Tipo de evento: Casamento',
      'Duração desejada: Dois dias',
      'Faixa de investimento: Até R$ 15.000',
      'Necessidades principais: montagem, som e recepção',
    ].join('\n'),
    packageName: 'Produção',
    basePrice: 1800,
    operationalFee: 150,
    extraGuests: 10,
    extraGuestFee: 15,
    addons: [
      { name: 'Som e iluminação base', price: 450, quantity: 1 },
      { name: 'Hora extra', price: 180, quantity: 2 },
    ],
  })

  assert.equal(draft?.eventType, 'Casamento')
  assert.equal(draft?.desiredDuration, 'Dois dias')
  assert.equal(draft?.budgetRange, 'Até R$ 15.000')
  assert.equal(draft?.requirements, 'montagem, som e recepção')
  assert.equal(draft?.estimatedAmount, 2910)
  assert.deepEqual(draft?.items.map((item) => item.source), [
    'base_package',
    'operational_fee',
    'extra_guests',
    'addon',
    'addon',
  ])
})

test('buildCustomQuoteDraft ignores regular bookings', () => {
  const draft = buildCustomQuoteDraft({
    notes: 'Reserva padrão',
    packageName: 'Celebração',
    basePrice: 1200,
    operationalFee: 150,
    extraGuests: 0,
    extraGuestFee: 18,
    addons: [],
  })

  assert.equal(draft, null)
})
