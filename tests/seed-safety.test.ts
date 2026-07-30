import assert from 'node:assert/strict'
import test from 'node:test'

import { classifyExistingProperty } from '../prisma/seed-safety'

test('seed safety allows the Villa Aurora demo and known legacy identities', () => {
  assert.equal(classifyExistingProperty('Villa Aurora'), 'sync')
  assert.equal(classifyExistingProperty('Venue Eventos'), 'sync')
  assert.equal(classifyExistingProperty('Chácara dos Sonhos'), 'sync')
})

test('seed safety rejects unrelated active properties before catalog reconciliation', () => {
  assert.equal(classifyExistingProperty('Operação de cliente'), 'reject')
  assert.equal(classifyExistingProperty('Outro Espaço'), 'reject')
})
