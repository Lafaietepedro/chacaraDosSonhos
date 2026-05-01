import test from 'node:test'
import assert from 'node:assert/strict'
import { parseCustomBookingNotes } from '../lib/custom-briefing'

test('parseCustomBookingNotes extracts structured custom briefing fields', () => {
  const briefing = parseCustomBookingNotes(`
    [Pacote sob medida]
    Tipo de evento: Corporativo
    Duração desejada: Dois dias
    Faixa de investimento: Até R$ 12.000
    Necessidades principais: palco, som e recepção

    Cliente prefere contato por WhatsApp.
  `)

  assert.equal(briefing.isCustom, true)
  assert.deepEqual(briefing.fields, [
    { label: 'Tipo de evento', value: 'Corporativo' },
    { label: 'Duração desejada', value: 'Dois dias' },
    { label: 'Faixa de investimento', value: 'Até R$ 12.000' },
    { label: 'Necessidades principais', value: 'palco, som e recepção' },
  ])
  assert.equal(briefing.remainingNotes, 'Cliente prefere contato por WhatsApp.')
})

test('parseCustomBookingNotes keeps regular notes untouched', () => {
  const briefing = parseCustomBookingNotes('Precisa de mesas extras.')

  assert.equal(briefing.isCustom, false)
  assert.deepEqual(briefing.fields, [])
  assert.equal(briefing.remainingNotes, 'Precisa de mesas extras.')
})
