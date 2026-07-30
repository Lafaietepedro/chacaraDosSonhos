import { calculateBookingPrice } from './services/pricing'
import type { AddonOption, PackageOption } from '../types/booking'

export function reconcileSelectedPackageId(packages: PackageOption[], selectedPackageId: string) {
  if (packages.some((item) => item.id === selectedPackageId)) return selectedPackageId
  return packages.find((item) => item.popular)?.id ?? packages[0]?.id ?? ''
}

export function buildPublicBookingSelection(params: {
  package: PackageOption
  addons: AddonOption[]
  selectedAddonIds: string[]
  guestCount: number
  operationalFee: number
}) {
  const selectedIds = new Set(params.selectedAddonIds)
  const selectedAddons = params.addons.filter(
    (addon) => addon.isActive !== false && selectedIds.has(addon.id)
  )
  const addonPayload = selectedAddons.map((addon) => ({
    id: addon.id,
    quantity: 1,
  }))
  const quote = calculateBookingPrice({
    package: {
      basePrice: params.package.price,
      includedGuests: params.package.capacity,
      extraGuestFee: params.package.extraPerGuest,
    },
    guestCount: params.guestCount,
    operationalFee: params.operationalFee,
    addons: selectedAddons.map((addon) => ({
      price: addon.price,
      quantity: 1,
    })),
  })

  return {
    ...quote,
    selectedAddons,
    addonPayload,
  }
}
