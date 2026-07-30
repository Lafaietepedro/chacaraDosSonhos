import assert from 'node:assert/strict'
import test from 'node:test'

import { buildPublicBookingSelection, reconcileSelectedPackageId } from '../lib/public-booking'
import type { AddonOption, PackageOption } from '../types/booking'

const celebrationPackage: PackageOption = {
  id: 'pkg-celebracao',
  slug: 'celebracao',
  name: 'Celebração',
  price: 7900,
  duration: '10 horas',
  capacity: 150,
  extraPerGuest: 55,
  description: 'Pacote de demonstração',
  features: [],
  notIncluded: [],
  popular: true,
}

const addons: AddonOption[] = [
  {
    id: 'addon-decoracao',
    name: 'Decoração floral',
    description: 'Composição para cerimônia e mesas',
    price: 1850,
    isActive: true,
  },
  {
    id: 'addon-limpeza',
    name: 'Limpeza pós-evento',
    description: 'Equipe completa após a desmontagem',
    price: 450,
    isActive: true,
  },
  {
    id: 'addon-inativo',
    name: 'Serviço inativo',
    description: 'Não pode entrar no pedido',
    price: 999,
    isActive: false,
  },
]

test('buildPublicBookingSelection uses the catalog for totals and API add-on payloads', () => {
  const result = buildPublicBookingSelection({
    package: celebrationPackage,
    addons,
    selectedAddonIds: ['addon-decoracao', 'addon-limpeza', 'addon-inativo', 'desconhecido'],
    guestCount: 160,
    operationalFee: 150,
  })

  assert.equal(result.extraGuests, 10)
  assert.equal(result.extraGuestsCost, 550)
  assert.equal(result.addonsCost, 2300)
  assert.equal(result.totalAmount, 10900)
  assert.deepEqual(result.addonPayload, [
    { id: 'addon-decoracao', quantity: 1 },
    { id: 'addon-limpeza', quantity: 1 },
  ])
  assert.deepEqual(result.selectedAddons.map((addon) => addon.id), [
    'addon-decoracao',
    'addon-limpeza',
  ])
})

test('reconcileSelectedPackageId preserves the selected package when catalog order changes', () => {
  const essential = { ...celebrationPackage, id: 'pkg-essential', popular: false }
  const reordered = [celebrationPackage, essential]

  assert.equal(reconcileSelectedPackageId(reordered, essential.id), essential.id)
})

test('reconcileSelectedPackageId falls back by identity when the selected package disappears', () => {
  const essential = { ...celebrationPackage, id: 'pkg-essential', popular: false }

  assert.equal(reconcileSelectedPackageId([essential, celebrationPackage], 'removed'), celebrationPackage.id)
})
