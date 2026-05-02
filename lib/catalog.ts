import { bookingAddons, bookingPackages } from '@/lib/site'
import type { AddonOption, PackageOption } from '@/types/booking'

export const fallbackPackageOptions: PackageOption[] = bookingPackages.map((pkg) => ({
  id: pkg.id,
  slug: pkg.id,
  name: pkg.name,
  price: pkg.price,
  duration: pkg.duration,
  capacity: pkg.capacity,
  extraPerGuest: pkg.extraPerGuest,
  description: pkg.description,
  features: [...pkg.features],
  notIncluded: [...pkg.notIncluded],
  popular: pkg.popular,
}))

export const fallbackAddonOptions: AddonOption[] = bookingAddons.map((addon, index) => ({
  id: `fallback-addon-${index}`,
  name: addon.name,
  description: addon.description,
  price: addon.price,
  isActive: true,
}))
