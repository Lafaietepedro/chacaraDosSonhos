type PackageForPricing = {
  basePrice: number
  includedGuests: number
  extraGuestFee: number
}

export function calculateBookingPrice(params: {
  package: PackageForPricing
  guestCount: number
  operationalFee: number
}) {
  const extraGuests = Math.max(0, params.guestCount - params.package.includedGuests)
  const extraGuestsCost = extraGuests * params.package.extraGuestFee
  const totalAmount = params.package.basePrice + params.operationalFee + extraGuestsCost

  return {
    extraGuests,
    extraGuestsCost,
    totalAmount,
  }
}
