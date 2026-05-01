import test from 'node:test'
import assert from 'node:assert/strict'
import { contactMessageSchema } from '../lib/validation/contact'

test('contactMessageSchema normalizes valid contact payloads', () => {
  const parsed = contactMessageSchema.parse({
    name: ' Cliente Teste ',
    email: 'CLIENTE@EXEMPLO.COM',
    phone: ' 5561999999999 ',
    subject: ' Orçamento ',
    message: 'Gostaria de consultar disponibilidade para um evento.',
  })

  assert.deepEqual(parsed, {
    name: 'Cliente Teste',
    email: 'cliente@exemplo.com',
    phone: '5561999999999',
    subject: 'Orçamento',
    message: 'Gostaria de consultar disponibilidade para um evento.',
  })
})

test('contactMessageSchema defaults optional fields to empty strings', () => {
  const parsed = contactMessageSchema.parse({
    name: 'Cliente Teste',
    email: 'cliente@exemplo.com',
    message: 'Mensagem com tamanho suficiente.',
  })

  assert.equal(parsed.phone, '')
  assert.equal(parsed.subject, '')
})

test('contactMessageSchema rejects short messages and invalid emails', () => {
  const result = contactMessageSchema.safeParse({
    name: 'C',
    email: 'email-invalido',
    message: 'curta',
  })

  assert.equal(result.success, false)
})
