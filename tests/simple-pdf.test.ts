import test from 'node:test'
import assert from 'node:assert/strict'
import { createSimplePdf } from '../lib/pdf/simple-pdf'

test('createSimplePdf returns a valid PDF buffer with xref table', () => {
  const pdf = createSimplePdf({
    title: 'Contrato Venue Eventos',
    subtitle: 'Reserva teste',
    lines: ['Cliente: Teste', 'Valor: R$ 1.200,00'],
  })
  const output = pdf.toString('latin1')

  assert.equal(output.startsWith('%PDF-1.4'), true)
  assert.match(output, /xref/)
  assert.match(output, /trailer/)
  assert.match(output, /Contrato Venue Eventos/)
})

test('createSimplePdf splits long documents into multiple pages', () => {
  const pdf = createSimplePdf({
    title: 'Contrato Venue Eventos',
    lines: Array.from({ length: 90 }, (_, index) => `Linha ${index + 1}`),
  })
  const output = pdf.toString('latin1')

  assert.match(output, /\/Count 3/)
  assert.match(output, /pagina 3 de 3/)
})
