import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateBookingPrice, isGuestCountWithinCapacity, pricesMatch } from '../lib/services/pricing'

const packageOption = {
  basePrice: 1200,
  includedGuests: 100,
  extraGuestFee: 18,
}

test('calculateBookingPrice keeps base price when guests fit package capacity', () => {
  const quote = calculateBookingPrice({
    package: packageOption,
    guestCount: 80,
    operationalFee: 150,
  })

  assert.deepEqual(quote, {
    extraGuests: 0,
    extraGuestsCost: 0,
    addonsCost: 0,
    totalAmount: 1350,
  })
})

test('calculateBookingPrice charges only guests above package capacity', () => {
  const quote = calculateBookingPrice({
    package: packageOption,
    guestCount: 112,
    operationalFee: 150,
  })

  assert.deepEqual(quote, {
    extraGuests: 12,
    extraGuestsCost: 216,
    addonsCost: 0,
    totalAmount: 1566,
  })
})

test('calculateBookingPrice includes selected add-ons', () => {
  const quote = calculateBookingPrice({
    package: packageOption,
    guestCount: 80,
    operationalFee: 150,
    addons: [
      { price: 180, quantity: 2 },
      { price: 450, quantity: 1 },
    ],
  })

  assert.deepEqual(quote, {
    extraGuests: 0,
    extraGuestsCost: 0,
    addonsCost: 810,
    totalAmount: 2160,
  })
})

test('pricesMatch compares monetary values in cents', () => {
  assert.equal(pricesMatch(10900, 10900), true)
  assert.equal(pricesMatch(10900.001, 10900), true)
  assert.equal(pricesMatch(10900.01, 10900), false)
})

test('isGuestCountWithinCapacity enforces the property limit', () => {
  assert.equal(isGuestCountWithinCapacity(1, 250), true)
  assert.equal(isGuestCountWithinCapacity(250, 250), true)
  assert.equal(isGuestCountWithinCapacity(251, 250), false)
})
