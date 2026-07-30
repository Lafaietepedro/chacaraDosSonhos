import assert from 'node:assert/strict'
import test from 'node:test'

import { bookingAddons, bookingPackages, siteConfig } from '../lib/site'
import { isExpectedCatalogIdentity } from '../lib/catalog'

test('Villa Aurora catalog is internally consistent', () => {
  assert.equal(siteConfig.venueName, 'Villa Aurora')
  assert.equal(siteConfig.capacity, 250)
  assert.equal(siteConfig.cleaningFee, 150)

  assert.deepEqual(
    bookingPackages.map((pkg) => ({
      id: pkg.id,
      price: pkg.price,
      duration: pkg.duration,
      capacity: pkg.capacity,
    })),
    [
      { id: 'essencial', price: 4500, duration: '6 horas', capacity: 80 },
      { id: 'celebracao', price: 7900, duration: '10 horas', capacity: 150 },
      { id: 'assinatura-aurora', price: 12500, duration: '14 horas', capacity: 250 },
    ]
  )

  assert.deepEqual(bookingPackages[0].features, [
    'Uso exclusivo do espaço',
    'Salão e jardim cerimonial',
    'Cozinha de apoio',
    'Estacionamento e segurança',
  ])
  assert.deepEqual(bookingPackages[2].notIncluded, [
    'Fornecedores de alimentação e bebidas',
  ])
  assert.deepEqual(bookingAddons.map((addon) => addon.name), [
    'Decoração floral',
    'Sonorização e DJ',
    'Iluminação cênica',
    'Mobiliário lounge',
    'Limpeza pós-evento',
    'Hora adicional',
    'Equipe de apoio extra',
    'Cerimonialista',
  ])
})

test('catalog identity must match the public Villa Aurora brand', () => {
  assert.equal(isExpectedCatalogIdentity({ name: 'Villa Aurora' }, siteConfig.venueName), true)
  assert.equal(isExpectedCatalogIdentity({ name: 'Venue Eventos' }, siteConfig.venueName), false)
  assert.equal(isExpectedCatalogIdentity(null, siteConfig.venueName), false)
})
