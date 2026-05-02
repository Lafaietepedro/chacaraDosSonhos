export type PackageOption = {
  id: string
  slug: string
  name: string
  price: number
  duration: string
  capacity: number
  extraPerGuest: number
  description: string
  features: string[]
  notIncluded: string[]
  popular: boolean
  isActive?: boolean
  sortOrder?: number
}

export type CatalogResponse = {
  property: {
    id: string
    name: string
    description: string
    capacity: number
    basePrice: number
    operationalFee: number
    contactEmail: string | null
    contactPhone: string | null
    address: string
  }
  packages: PackageOption[]
  addons: AddonOption[]
}

export type AddonOption = {
  id: string
  name: string
  description: string
  price: number
  isActive?: boolean
}

export type SelectedBookingAddon = AddonOption & {
  quantity: number
  total: number
}

export type DashboardBooking = {
  id: string
  customer: string
  email: string
  phone: string
  date: string | null
  guests: number
  extraGuests: number
  packageId: string | null
  packageName: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected'
  total: number
  createdAt: string
  notes: string | null
  addons: SelectedBookingAddon[]
}

export type DashboardStats = {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  cancelledBookings: number
  monthlyRevenue: number
  occupancyRate: number
}

export type DashboardPagination = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type DashboardBlockedDate = {
  id: string
  startDate: string
  endDate: string
  reason: string | null
}

export type DashboardContactMessage = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'NEW' | 'READ' | 'ARCHIVED'
  createdAt: string
}

export type PropertySettingsInput = {
  name: string
  description: string
  capacity: number
  operationalFee: number
  contactEmail: string
  contactPhone: string
  address: string
}

export type PackageSettingsInput = {
  slug: string
  name: string
  description: string
  price: number
  duration: string
  capacity: number
  extraPerGuest: number
  features: string[]
  notIncluded: string[]
  popular: boolean
  isActive: boolean
  sortOrder: number
}
