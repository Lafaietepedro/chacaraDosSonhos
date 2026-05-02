type PackageForPricing = {
  basePrice: number
  includedGuests: number
  extraGuestFee: number
}

type AddonForPricing = {
  price: number
  quantity: number
}

export function calculateBookingPrice(params: {
  package: PackageForPricing
  guestCount: number
  operationalFee: number
  addons?: AddonForPricing[]
}) {
  const extraGuests = Math.max(0, params.guestCount - params.package.includedGuests)
  const extraGuestsCost = extraGuests * params.package.extraGuestFee
  const addonsCost = (params.addons ?? []).reduce((sum, addon) => {
    return sum + addon.price * addon.quantity
  }, 0)
  const totalAmount = params.package.basePrice + params.operationalFee + extraGuestsCost + addonsCost

  return {
    extraGuests,
    extraGuestsCost,
    addonsCost,
    totalAmount,
  }
}
