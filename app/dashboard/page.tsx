'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/calendar'
import { LoginForm } from '@/components/auth/login-form'
import { BrandLogo } from '@/components/brand-logo'
import { useAuth } from '@/lib/auth'
import { 
  Calendar as CalendarIcon, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Eye,
  User,
  Mail,
  Phone,
  MessageSquare,
  SlidersHorizontal,
  X,
  LogOut,
  Search,
  Inbox,
  type LucideIcon
} from 'lucide-react'
import { formatCurrency, formatDate, parseLocalDate } from '@/lib/utils'
import { siteConfig } from '@/lib/site'
import { parseCustomBookingNotes } from '@/lib/custom-briefing'
import type {
  AddonOption,
  AddonSettingsInput,
  CatalogResponse,
  DashboardBlockedDate,
  DashboardBooking,
  DashboardContactMessage,
  DashboardPagination,
  DashboardStats,
  PackageOption,
  PackageSettingsInput,
  PropertySettingsInput,
} from '@/types/booking'

const emptyStats: DashboardStats = {
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  monthlyRevenue: 0,
  occupancyRate: 0,
}

const emptyPagination: DashboardPagination = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
}

const defaultPropertySettings: PropertySettingsInput = {
  name: siteConfig.venueName,
  description: siteConfig.longPitch,
  capacity: siteConfig.capacity,
  operationalFee: siteConfig.cleaningFee,
  contactEmail: siteConfig.email,
  contactPhone: siteConfig.phone,
  address: `${siteConfig.address} - ${siteConfig.city}`,
}

const emptyPackageForm: PackageSettingsInput = {
  slug: '',
  name: '',
  description: '',
  price: 0,
  duration: '8 horas',
  capacity: 50,
  extraPerGuest: 0,
  features: [],
  notIncluded: [],
  popular: false,
  isActive: true,
  sortOrder: 0,
}

const emptyAddonForm: AddonSettingsInput = {
  name: '',
  description: '',
  price: 0,
  isActive: true,
}

type BookingFilterState = {
  search: string
  status: string
  from: string
  to: string
}

type DashboardNotice = {
  type: 'success' | 'error'
  message: string
}

type BookingStatusUpdate = 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}

type StatTileProps = {
  icon: LucideIcon
  label: string
  value: string | number
  helper: string
  tone: 'emerald' | 'amber' | 'blue' | 'slate'
}

const emptyBookingFilters: BookingFilterState = {
  search: '',
  status: 'all',
  from: '',
  to: '',
}

const dashboardTabs = [
  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { id: 'bookings', label: 'Reservas', icon: CalendarIcon },
  { id: 'contacts', label: 'Contatos', icon: Mail },
  { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
  { id: 'settings', label: 'Configurações', icon: Settings },
]

function packageToForm(pkg: PackageOption): PackageSettingsInput {
  return {
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    duration: pkg.duration,
    capacity: pkg.capacity,
    extraPerGuest: pkg.extraPerGuest,
    features: pkg.features,
    notIncluded: pkg.notIncluded,
    popular: pkg.popular,
    isActive: pkg.isActive ?? true,
    sortOrder: pkg.sortOrder ?? 0,
  }
}

function listToText(items: string[]) {
  return items.join('\n')
}

function textToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed bg-gray-50/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

function StatTile({ icon: Icon, label, value, helper, tone }: StatTileProps) {
  const tones: Record<StatTileProps['tone'], string> = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          </div>
          <div className={`rounded-md p-2 ring-1 ring-inset ${tones[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{helper}</p>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: DashboardBooking['status'] }) {
  const styles: Record<DashboardBooking['status'], { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-yellow-50 text-yellow-700 ring-yellow-200' },
    confirmed: { label: 'Confirmada', className: 'bg-green-50 text-green-700 ring-green-200' },
    rejected: { label: 'Recusada', className: 'bg-red-50 text-red-700 ring-red-200' },
    cancelled: { label: 'Cancelada', className: 'bg-gray-100 text-gray-700 ring-gray-200' },
    completed: { label: 'Concluída', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  }

  const style = styles[status]

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.className}`}>
      {style.label}
    </span>
  )
}

function CustomBriefingBadge({ notes }: { notes: string | null }) {
  const briefing = parseCustomBookingNotes(notes)

  if (!briefing.isCustom) return null

  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
      Sob medida
    </span>
  )
}

function CustomBriefingPreview({ notes }: { notes: string | null }) {
  const briefing = parseCustomBookingNotes(notes)

  if (!briefing.isCustom) return null

  const previewFields = briefing.fields.slice(0, 2)

  return (
    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
      <div className="flex items-start gap-2">
        <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-950">Pedido sob medida</p>
          {previewFields.length > 0 ? (
            <p className="mt-1 break-words text-sm leading-6 text-emerald-900/80">
              {previewFields.map((field) => `${field.label}: ${field.value}`).join(' · ')}
            </p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-emerald-900/80">
              Briefing registrado nas observações da reserva.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingNotesPanel({ notes }: { notes: string | null }) {
  const briefing = parseCustomBookingNotes(notes)

  if (!briefing.isCustom && !briefing.remainingNotes) return null

  if (!briefing.isCustom) {
    return (
      <div>
        <h4 className="mb-2 font-medium text-gray-900">Observações</h4>
        <div className="flex items-start text-sm">
          <MessageSquare className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
          <span className="whitespace-pre-line break-words text-gray-600">{briefing.remainingNotes}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
        <h4 className="font-semibold text-emerald-950">Briefing sob medida</h4>
      </div>

      {briefing.fields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {briefing.fields.map((field) => (
            <div key={field.label} className="rounded-md bg-white/80 p-3 ring-1 ring-inset ring-emerald-100">
              <p className="text-xs font-semibold uppercase text-emerald-700">{field.label}</p>
              <p className="mt-1 break-words text-sm leading-6 text-slate-900">{field.value}</p>
            </div>
          ))}
        </div>
      )}

      {briefing.remainingNotes && (
        <div className="mt-3 rounded-md bg-white/80 p-3 ring-1 ring-inset ring-emerald-100">
          <p className="text-xs font-semibold uppercase text-emerald-700">Observações adicionais</p>
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-900">{briefing.remainingNotes}</p>
        </div>
      )}
    </div>
  )
}

function BookingAddonsPanel({ addons }: { addons: DashboardBooking['addons'] }) {
  if (addons.length === 0) return null

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-950">Adicionais selecionados</h4>
      <div className="mt-3 space-y-2">
        {addons.map((addon) => (
          <div key={addon.id} className="flex items-start justify-between gap-4 rounded-md bg-white p-3 text-sm ring-1 ring-inset ring-slate-200">
            <div>
              <p className="font-medium text-slate-950">{addon.quantity}x {addon.name}</p>
              {addon.description && (
                <p className="mt-1 leading-5 text-slate-500">{addon.description}</p>
              )}
            </div>
            <span className="shrink-0 font-semibold text-slate-950">{formatCurrency(addon.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getStatusUpdateSuccessMessage(status: BookingStatusUpdate) {
  const messages: Record<BookingStatusUpdate, string> = {
    CONFIRMED: 'Reserva aprovada com sucesso.',
    REJECTED: 'Reserva recusada com sucesso.',
    CANCELLED: 'Reserva cancelada com sucesso.',
    COMPLETED: 'Reserva marcada como concluída.',
  }

  return messages[status]
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading, login, logout, getToken } = useAuth()
  const authRef = useRef({ getToken, logout })
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [blockedDates, setBlockedDates] = useState<DashboardBlockedDate[]>([])
  const [selectedBooking, setSelectedBooking] = useState<DashboardBooking | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<DashboardBooking | null>(null)
  const [notice, setNotice] = useState<DashboardNotice | null>(null)

  // Função para converter data recebida de string do JSON para Date object
  const parseBookingDate = (date: string | Date | null): Date => {
    try {
      if (!date) return new Date()
      
      if (typeof date === 'string') {
        // Se é uma string, garantir formato ISO 
        let dateStr = date
        if (!date.includes('T')) {
          dateStr = date + 'T12:00:00.000Z'
        }
        const parsed = new Date(dateStr)
        return isNaN(parsed.getTime()) ? new Date() : parsed
      } else if (date instanceof Date) {
        return isNaN(date.getTime()) ? new Date() : date
      } else {
        const parsed = new Date(date)
        return isNaN(parsed.getTime()) ? new Date() : parsed
      }
    } catch (error) {
      console.error('Error parsing date:', date, error)
      return new Date()
    }
  }

  const [recentBookings, setRecentBookings] = useState<DashboardBooking[]>([])
  const [bookingPagination, setBookingPagination] = useState<DashboardPagination>(emptyPagination)
  const [bookingPage, setBookingPage] = useState(1)
  const [contactMessages, setContactMessages] = useState<DashboardContactMessage[]>([])
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [propertySettings, setPropertySettings] = useState<PropertySettingsInput>(defaultPropertySettings)
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [addons, setAddons] = useState<AddonOption[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [selectedAddonId, setSelectedAddonId] = useState<string | null>(null)
  const [packageForm, setPackageForm] = useState<PackageSettingsInput>(emptyPackageForm)
  const [addonForm, setAddonForm] = useState<AddonSettingsInput>(emptyAddonForm)
  const [bookingFilters, setBookingFilters] = useState<BookingFilterState>(emptyBookingFilters)
  const [filterDraft, setFilterDraft] = useState<BookingFilterState>(emptyBookingFilters)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isSavingPackage, setIsSavingPackage] = useState(false)
  const [isSavingAddon, setIsSavingAddon] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const showNotice = useCallback((nextNotice: DashboardNotice) => {
    setNotice(nextNotice)
  }, [])

  useEffect(() => {
    authRef.current = { getToken, logout }
  }, [getToken, logout])

  useEffect(() => {
    if (!notice) return

    const timeoutId = window.setTimeout(() => {
      setNotice(null)
    }, 4500)

    return () => window.clearTimeout(timeoutId)
  }, [notice])

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = authRef.current.getToken()
      const params = new URLSearchParams()

      if (bookingFilters.search.trim()) params.set('search', bookingFilters.search.trim())
      if (bookingFilters.status !== 'all') params.set('status', bookingFilters.status)
      if (bookingFilters.from) params.set('from', bookingFilters.from)
      if (bookingFilters.to) params.set('to', bookingFilters.to)
      params.set('page', String(bookingPage))
      params.set('take', String(emptyPagination.pageSize))

      const queryString = params.toString()
      const res = await fetch(`/api/dashboard${queryString ? `?${queryString}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        if (res.status === 401) {
          authRef.current.logout()
          return
        }
        throw new Error('Erro ao carregar dados')
      }
      const data = await res.json() as {
        recentBookings: DashboardBooking[]
        stats: DashboardStats
        pagination: DashboardPagination
      }
      setRecentBookings(data.recentBookings)
      setStats(data.stats)
      setBookingPagination(data.pagination)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    }
  }, [bookingFilters, bookingPage])

  const fetchBlockedDates = useCallback(async () => {
    try {
      const token = authRef.current.getToken()
      const res = await fetch('/api/dashboard/blocked-dates', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        if (res.status === 401) authRef.current.logout()
        return
      }
      const data = await res.json() as { blockedDates: DashboardBlockedDate[] }
      setBlockedDates(data.blockedDates)
    } catch (err) {
      console.error('Erro ao carregar datas bloqueadas:', err)
    }
  }, [])

  const fetchContactMessages = useCallback(async () => {
    try {
      const token = authRef.current.getToken()
      const res = await fetch('/api/dashboard/contact-messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        if (res.status === 401) authRef.current.logout()
        return
      }
      const data = await res.json() as { contactMessages: DashboardContactMessage[] }
      setContactMessages(data.contactMessages)
    } catch (err) {
      console.error('Erro ao carregar mensagens de contato:', err)
    }
  }, [])

  const fetchPropertySettings = useCallback(async () => {
    try {
      const token = authRef.current.getToken()
      const res = await fetch('/api/dashboard/property', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        if (res.status === 401) authRef.current.logout()
        return
      }

      const data = await res.json() as CatalogResponse
      setPropertySettings({
        name: data.property.name,
        description: data.property.description,
        capacity: data.property.capacity,
        operationalFee: data.property.operationalFee,
        contactEmail: data.property.contactEmail ?? '',
        contactPhone: data.property.contactPhone ?? '',
        address: data.property.address,
      })
      setPackages(data.packages)

      const addonsRes = await fetch('/api/dashboard/addons', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (addonsRes.ok) {
        const addonsData = await addonsRes.json() as { addons: AddonOption[] }
        setAddons(addonsData.addons)
      } else if (addonsRes.status === 401) {
        authRef.current.logout()
        return
      } else {
        setAddons(data.addons)
      }

      if (data.packages.length > 0) {
        setSelectedPackageId((current) => {
          if (current) return current
          setPackageForm(packageToForm(data.packages[0]))
          return data.packages[0].id
        })
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
      fetchBlockedDates()
      fetchContactMessages()
      fetchPropertySettings()
    }
  }, [fetchBlockedDates, fetchContactMessages, fetchDashboardData, fetchPropertySettings, isAuthenticated])

  // Mostrar tela de loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Mostrar formulário de login se não autenticado
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />
  }

  // Dashboard principal (apenas se autenticado)

  const handleBlockDate = async () => {
    if (!selectedDate) return

    try {
      const token = getToken()
      const res = await fetch('/api/dashboard/blocked-dates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split('T')[0],
          reason: 'Bloqueio manual',
        }),
      })

      if (!res.ok) throw new Error('Falha ao bloquear data')

      await fetchBlockedDates()
      setSelectedDate(undefined)
      showNotice({ type: 'success', message: 'Data bloqueada com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({ type: 'error', message: 'Não foi possível bloquear a data. Tente novamente.' })
    }
  }

  const handleUnblockDate = async (blockedDateId: string) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/dashboard/blocked-dates/${blockedDateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Falha ao desbloquear data')

      await fetchBlockedDates()
      showNotice({ type: 'success', message: 'Data desbloqueada com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({ type: 'error', message: 'Não foi possível desbloquear a data. Tente novamente.' })
    }
  }

  const updatePropertySetting = <Key extends keyof PropertySettingsInput>(
    key: Key,
    value: PropertySettingsInput[Key]
  ) => {
    setPropertySettings((current) => ({ ...current, [key]: value }))
  }

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true)
      const token = getToken()
      const res = await fetch('/api/dashboard/property', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertySettings),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao salvar configurações')
      }

      const data = await res.json() as CatalogResponse
      setPropertySettings({
        name: data.property.name,
        description: data.property.description,
        capacity: data.property.capacity,
        operationalFee: data.property.operationalFee,
        contactEmail: data.property.contactEmail ?? '',
        contactPhone: data.property.contactPhone ?? '',
        address: data.property.address,
      })
      setPackages(data.packages)
      showNotice({ type: 'success', message: 'Configurações salvas com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível salvar as configurações.',
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const fetchPackages = async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/dashboard/packages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Falha ao carregar pacotes')

      const data = await res.json() as { packages: PackageOption[] }
      setPackages(data.packages)
      return data.packages
    } catch (error) {
      console.error(error)
      return packages
    }
  }

  const fetchAddons = async () => {
    try {
      const token = getToken()
      const res = await fetch('/api/dashboard/addons', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Falha ao carregar adicionais')

      const data = await res.json() as { addons: AddonOption[] }
      setAddons(data.addons)
      return data.addons
    } catch (error) {
      console.error(error)
      return addons
    }
  }

  const handleSelectPackage = (pkg: PackageOption) => {
    setSelectedPackageId(pkg.id)
    setPackageForm(packageToForm(pkg))
  }

  const handleNewPackage = () => {
    setSelectedPackageId(null)
    setPackageForm({
      ...emptyPackageForm,
      sortOrder: packages.length,
    })
  }

  const handleSelectAddon = (addon: AddonOption) => {
    setSelectedAddonId(addon.id)
    setAddonForm({
      name: addon.name,
      description: addon.description,
      price: addon.price,
      isActive: addon.isActive ?? true,
    })
  }

  const handleNewAddon = () => {
    setSelectedAddonId(null)
    setAddonForm(emptyAddonForm)
  }

  const updatePackageForm = <Key extends keyof PackageSettingsInput>(
    key: Key,
    value: PackageSettingsInput[Key]
  ) => {
    setPackageForm((current) => ({ ...current, [key]: value }))
  }

  const updateAddonForm = <Key extends keyof AddonSettingsInput>(
    key: Key,
    value: AddonSettingsInput[Key]
  ) => {
    setAddonForm((current) => ({ ...current, [key]: value }))
  }

  const handleSavePackage = async () => {
    try {
      setIsSavingPackage(true)
      const token = getToken()
      const endpoint = selectedPackageId
        ? `/api/dashboard/packages/${selectedPackageId}`
        : '/api/dashboard/packages'
      const res = await fetch(endpoint, {
        method: selectedPackageId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageForm),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao salvar pacote')
      }

      const data = await res.json() as { package: PackageOption }
      const updatedPackages = await fetchPackages()
      setSelectedPackageId(data.package.id)
      setPackageForm(packageToForm(updatedPackages.find((pkg) => pkg.id === data.package.id) ?? data.package))
      showNotice({ type: 'success', message: 'Pacote salvo com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível salvar o pacote.',
      })
    } finally {
      setIsSavingPackage(false)
    }
  }

  const handleSaveAddon = async () => {
    try {
      setIsSavingAddon(true)
      const token = getToken()
      const endpoint = selectedAddonId
        ? `/api/dashboard/addons/${selectedAddonId}`
        : '/api/dashboard/addons'
      const res = await fetch(endpoint, {
        method: selectedAddonId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addonForm),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao salvar adicional')
      }

      const data = await res.json() as { addon: AddonOption }
      const updatedAddons = await fetchAddons()
      setSelectedAddonId(data.addon.id)
      const currentAddon = updatedAddons.find((addon) => addon.id === data.addon.id) ?? data.addon
      setAddonForm({
        name: currentAddon.name,
        description: currentAddon.description,
        price: currentAddon.price,
        isActive: currentAddon.isActive ?? true,
      })
      showNotice({ type: 'success', message: 'Adicional salvo com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível salvar o adicional.',
      })
    } finally {
      setIsSavingAddon(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotice({ type: 'error', message: 'A confirmação precisa ser igual à nova senha.' })
      return
    }

    try {
      setIsChangingPassword(true)
      const token = getToken()
      const res = await fetch('/api/dashboard/admin-password', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao alterar senha')
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      showNotice({ type: 'success', message: 'Senha alterada com sucesso.' })
    } catch (error) {
      console.error(error)
      showNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível alterar a senha.',
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const updateContactMessageStatus = async (
    id: string,
    status: DashboardContactMessage['status']
  ) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/dashboard/contact-messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Falha ao atualizar mensagem')

      setContactMessages((current) =>
        current.map((message) => message.id === id ? { ...message, status } : message)
      )
      showNotice({ type: 'success', message: 'Mensagem atualizada.' })
    } catch (error) {
      console.error(error)
      showNotice({ type: 'error', message: 'Não foi possível atualizar a mensagem. Tente novamente.' })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const showBookingDetails = (booking: DashboardBooking) => {
    setSelectedBooking(booking)
    setIsDetailsModalOpen(true)
  }

  const updateFilterDraft = <Key extends keyof BookingFilterState>(
    key: Key,
    value: BookingFilterState[Key]
  ) => {
    setFilterDraft((current) => ({ ...current, [key]: value }))
  }

  const applyBookingFilters = () => {
    setBookingPage(1)
    setBookingFilters(filterDraft)
  }

  const clearBookingFilters = () => {
    setFilterDraft(emptyBookingFilters)
    setBookingPage(1)
    setBookingFilters(emptyBookingFilters)
  }

  const updateStatus = async (id: string, status: BookingStatusUpdate) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = res.status === 409
          ? 'Essa mudança de status não é permitida para a reserva atual.'
          : data?.error || 'Falha ao atualizar'
        throw new Error(message)
      }
      
      await fetchDashboardData()
      setIsDetailsModalOpen(false)
      showNotice({ type: 'success', message: getStatusUpdateSuccessMessage(status) })
    } catch (e) {
      console.error(e)
      showNotice({
        type: 'error',
        message: e instanceof Error ? e.message : 'Não foi possível atualizar o status. Tente novamente.',
      })
    }
  }

  const deleteBooking = async (booking: DashboardBooking) => {
    try {
      const token = getToken()
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Falha ao excluir')
      }
      
      await fetchDashboardData()
      setIsDetailsModalOpen(false)
      setBookingToDelete(null)
      showNotice({ type: 'success', message: `Reserva de ${booking.customer} excluída com sucesso.` })
    } catch (e) {
      console.error(e)
      showNotice({
        type: 'error',
        message: `Não foi possível excluir a reserva. ${e instanceof Error ? e.message : 'Tente novamente.'}`,
      })
    }
  }

  const customBookingCount = recentBookings.filter((booking) =>
    parseCustomBookingNotes(booking.notes).isCustom
  ).length

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <BrandLogo variant="light" markClassName="h-9 w-9" />
              <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Painel do Anfitrião</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Acompanhe solicitações, agenda, contatos e configurações do espaço em uma rotina operacional.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={() => setActiveTab('settings')} className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link href="/booking">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Reserva
                </Link>
              </Button>
              <Button variant="outline" onClick={logout} className="border-white/20 bg-transparent text-slate-200 hover:bg-red-500 hover:text-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {notice && (
          <div
            className={`mb-6 flex items-start justify-between rounded-lg border px-4 py-3 text-sm ${
              notice.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <span>{notice.message}</span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="ml-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8 flex w-full gap-1 overflow-x-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm lg:w-fit">
          {dashboardTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatTile
                icon={CalendarIcon}
                label="Total de reservas"
                value={stats.totalBookings}
                helper="Solicitações registradas no histórico da operação."
                tone="slate"
              />
              <StatTile
                icon={AlertCircle}
                label="Pendentes"
                value={stats.pendingBookings}
                helper="Pedidos aguardando decisão do anfitrião."
                tone="amber"
              />
              <StatTile
                icon={DollarSign}
                label="Receita mensal"
                value={formatCurrency(stats.monthlyRevenue)}
                helper="Reservas confirmadas ou concluídas no mês."
                tone="emerald"
              />
              <StatTile
                icon={Users}
                label="Ocupação"
                value={`${stats.occupancyRate}%`}
                helper="Dias ocupados em relação ao mês atual."
                tone="blue"
              />
            </div>

            {/* Recent Bookings */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-950">Reservas recentes</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">Últimas solicitações recebidas pelo fluxo público.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>
                    Ver todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <EmptyState
                      icon={Inbox}
                      title="Nenhuma reserva recente"
                      description="As novas solicitações aparecerão aqui assim que clientes enviarem pedidos pelo fluxo público."
                      action={
                        <Button asChild>
                          <Link href="/booking">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar reserva
                          </Link>
                        </Button>
                      }
                    />
                  ) : recentBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(booking.status)}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-slate-950">{booking.customer}</p>
                            <CustomBriefingBadge notes={booking.notes} />
                          </div>
                          <p className="text-sm text-slate-500">
                            {booking.date ? formatDate(parseBookingDate(booking.date)) : 'Data não disponível'} • {booking.guests} pessoas
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 sm:text-right">
                        <p className="font-semibold text-slate-950">{formatCurrency(booking.total)}</p>
                        <StatusBadge status={booking.status} />
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => showBookingDetails(booking)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl text-slate-950">Gerenciar reservas</CardTitle>
                <p className="text-sm text-slate-500">Filtre, analise e avance o status das solicitações.</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_auto]">
                  <div>
                    <Label htmlFor="booking-search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="booking-search"
                        value={filterDraft.search}
                        onChange={(event) => updateFilterDraft('search', event.target.value)}
                        placeholder="Nome, email ou telefone"
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="booking-status">Status</Label>
                    <select
                      id="booking-status"
                      value={filterDraft.status}
                      onChange={(event) => updateFilterDraft('status', event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendentes</option>
                      <option value="confirmed">Confirmadas</option>
                      <option value="rejected">Recusadas</option>
                      <option value="cancelled">Canceladas</option>
                      <option value="completed">Concluídas</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="booking-from">De</Label>
                    <Input
                      id="booking-from"
                      type="date"
                      value={filterDraft.from}
                      onChange={(event) => updateFilterDraft('from', event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="booking-to">Até</Label>
                    <Input
                      id="booking-to"
                      type="date"
                      value={filterDraft.to}
                      onChange={(event) => updateFilterDraft('to', event.target.value)}
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <Button onClick={applyBookingFilters} className="flex-1 lg:flex-none">
                      Filtrar
                    </Button>
                    <Button variant="outline" onClick={clearBookingFilters} className="flex-1 lg:flex-none">
                      Limpar
                    </Button>
                  </div>
                </div>

                <p className="mb-4 text-sm text-slate-500">
                  Mostrando {recentBookings.length} de {bookingPagination.totalItems} {bookingPagination.totalItems === 1 ? 'reserva' : 'reservas'}
                </p>

                {customBookingCount > 0 && (
                  <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <div className="flex items-start gap-2">
                      <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <p>
                        {customBookingCount} {customBookingCount === 1 ? 'pedido sob medida nesta página precisa' : 'pedidos sob medida nesta página precisam'} de análise de briefing antes da confirmação.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="Nenhuma reserva encontrada"
                      description="Ajuste os filtros ou limpe a busca para voltar à lista completa de solicitações."
                      action={
                        <Button variant="outline" onClick={clearBookingFilters}>
                          Limpar filtros
                        </Button>
                      }
                    />
                  ) : recentBookings.map((booking) => (
                    <div key={booking.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{booking.customer}</h3>
                            <CustomBriefingBadge notes={booking.notes} />
                          </div>
                          <p className="text-sm text-slate-500">{booking.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>

                      <CustomBriefingPreview notes={booking.notes} />
                      {booking.addons.length > 0 && (
                        <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs font-semibold uppercase text-slate-500">Adicionais</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">
                            {booking.addons.map((addon) => `${addon.quantity}x ${addon.name}`).join(' · ')}
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase text-slate-500">Data</p>
                          <p className="mt-1 font-medium text-slate-950">{booking.date ? formatDate(parseBookingDate(booking.date)) : 'Data não disponível'}</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase text-slate-500">Convidados</p>
                          <p className="mt-1 font-medium text-slate-950">{booking.guests} pessoas</p>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-medium uppercase text-slate-500">Pacote</p>
	                          <p className="mt-1 font-medium text-slate-950">{booking.packageName}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="text-2xl font-bold text-slate-950">
                          {formatCurrency(booking.total)}
                        </div>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => showBookingDetails(booking)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </Button>
                              {booking.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
	                                    onClick={() => updateStatus(booking.id, 'REJECTED')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Recusar
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => updateStatus(booking.id, 'CONFIRMED')}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar
                                  </Button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateStatus(booking.id, 'CANCELLED')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => updateStatus(booking.id, 'COMPLETED')}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Concluir
                                  </Button>
                                </>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setBookingToDelete(booking)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Excluir
                              </Button>
                            </div>
                      </div>
                    </div>
                  ))}
                </div>

                {bookingPagination.totalPages > 1 && (
                  <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                      Página {bookingPagination.page} de {bookingPagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={bookingPagination.page <= 1}
                        onClick={() => setBookingPage((current) => Math.max(current - 1, 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        disabled={bookingPagination.page >= bookingPagination.totalPages}
                        onClick={() => setBookingPage((current) => Math.min(current + 1, bookingPagination.totalPages))}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens de Contato</CardTitle>
              </CardHeader>
              <CardContent>
                {contactMessages.length === 0 ? (
                  <EmptyState
                    icon={Mail}
                    title="Nenhuma mensagem recebida"
                    description="Quando alguém entrar em contato pela página pública, a conversa aparecerá aqui para acompanhamento."
                  />
                ) : (
                  <div className="space-y-4">
                    {contactMessages.map((contactMessage) => (
                      <div key={contactMessage.id} className="rounded-lg border p-5">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{contactMessage.name}</h3>
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                contactMessage.status === 'NEW'
                                  ? 'bg-blue-100 text-blue-700'
                                  : contactMessage.status === 'READ'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {contactMessage.status === 'NEW'
                                  ? 'Nova'
                                  : contactMessage.status === 'READ'
                                    ? 'Lida'
                                    : 'Arquivada'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(contactMessage.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {contactMessage.status !== 'READ' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateContactMessageStatus(contactMessage.id, 'READ')}
                              >
                                Marcar como lida
                              </Button>
                            )}
                            {contactMessage.status !== 'ARCHIVED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateContactMessageStatus(contactMessage.id, 'ARCHIVED')}
                              >
                                Arquivar
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium">{contactMessage.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Telefone</p>
                            <p className="font-medium">{contactMessage.phone || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Assunto</p>
                            <p className="font-medium">{contactMessage.subject || 'Sem assunto'}</p>
                          </div>
                        </div>

                        <p className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                          {contactMessage.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Calendar
                onDateSelect={setSelectedDate}
	                selectedDate={selectedDate}
	                blockedDates={blockedDates.map((blockedDate) => parseBookingDate(blockedDate.startDate))}
                bookings={recentBookings
                  .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
                  .map(booking => ({
                    startDate: booking.date ? parseBookingDate(booking.date) : new Date(),
                    endDate: booking.date ? parseBookingDate(booking.date) : new Date(),
                    status: booking.status === 'confirmed' ? 'confirmed' as const : 
                            booking.status === 'pending' ? 'pending' as const : 'blocked' as const
                  }))}
              />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bloquear Datas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="block-date">Data</Label>
                    <Input
                      id="block-date"
	                      type="date"
	                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
	                      onChange={(e) => setSelectedDate(e.target.value ? parseLocalDate(e.target.value) : undefined)}
	                    />
                  </div>
                  <Button onClick={handleBlockDate} disabled={!selectedDate} className="w-full">
                    Bloquear Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Datas Bloqueadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
	                    {blockedDates.length === 0 ? (
	                      <EmptyState
	                        icon={CalendarIcon}
	                        title="Agenda sem bloqueios"
	                        description="Bloqueie datas indisponíveis para impedir novas solicitações nesses dias."
	                      />
	                    ) : (
	                      blockedDates.map((blockedDate) => (
	                        <div key={blockedDate.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
	                          <span className="text-sm">{formatDate(parseBookingDate(blockedDate.startDate))}</span>
	                          <Button
	                            size="sm"
	                            variant="outline"
	                            onClick={() => handleUnblockDate(blockedDate.id)}
	                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Espaço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="property-name">Nome da Propriedade</Label>
                  <Input
                    id="property-name"
                    value={propertySettings.name}
                    onChange={(event) => updatePropertySetting('name', event.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacidade Máxima</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min={1}
                      value={propertySettings.capacity}
                      onChange={(event) => updatePropertySetting('capacity', Number(event.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="operational-fee">Taxa Operacional (R$)</Label>
                    <Input
                      id="operational-fee"
                      type="number"
                      min={0}
                      step="0.01"
                      value={propertySettings.operationalFee}
                      onChange={(event) => updatePropertySetting('operationalFee', Number(event.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-email">Email de Contato</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={propertySettings.contactEmail}
                      onChange={(event) => updatePropertySetting('contactEmail', event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact-phone">Telefone de Contato</Label>
                    <Input
                      id="contact-phone"
                      value={propertySettings.contactPhone}
                      onChange={(event) => updatePropertySetting('contactPhone', event.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={propertySettings.address}
                    onChange={(event) => updatePropertySetting('address', event.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value={propertySettings.description}
                    onChange={(event) => updatePropertySetting('description', event.target.value)}
                  />
                </div>
                
                <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                  {isSavingSettings ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Segurança do Administrador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      minLength={8}
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      minLength={8}
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }))}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword
                  }
                >
                  {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </CardContent>
            </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pacotes</CardTitle>
                    <Button size="sm" variant="outline" onClick={handleNewPackage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {packages.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum pacote cadastrado.</p>
                  ) : (
                    packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          selectedPackageId === pkg.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{pkg.name}</p>
                            <p className="text-sm text-gray-500">{pkg.duration} • até {pkg.capacity} pessoas</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{formatCurrency(pkg.price)}</p>
                            <p className={`text-xs ${pkg.isActive === false ? 'text-red-600' : 'text-green-600'}`}>
                              {pkg.isActive === false ? 'Inativo' : 'Ativo'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{selectedPackageId ? 'Editar Pacote' : 'Novo Pacote'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="package-name">Nome</Label>
                    <Input
                      id="package-name"
                      value={packageForm.name}
                      onChange={(event) => updatePackageForm('name', event.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="package-price">Preço</Label>
                      <Input
                        id="package-price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={packageForm.price}
                        onChange={(event) => updatePackageForm('price', Number(event.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="package-order">Ordem</Label>
                      <Input
                        id="package-order"
                        type="number"
                        value={packageForm.sortOrder}
                        onChange={(event) => updatePackageForm('sortOrder', Number(event.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="package-duration">Duração</Label>
                      <Input
                        id="package-duration"
                        value={packageForm.duration}
                        onChange={(event) => updatePackageForm('duration', event.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="package-capacity">Capacidade</Label>
                      <Input
                        id="package-capacity"
                        type="number"
                        min={1}
                        value={packageForm.capacity}
                        onChange={(event) => updatePackageForm('capacity', Number(event.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="package-extra">Valor por convidado extra</Label>
                    <Input
                      id="package-extra"
                      type="number"
                      min={0}
                      step="0.01"
                      value={packageForm.extraPerGuest}
                      onChange={(event) => updatePackageForm('extraPerGuest', Number(event.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="package-description">Descrição</Label>
                    <textarea
                      id="package-description"
                      rows={3}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={packageForm.description}
                      onChange={(event) => updatePackageForm('description', event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="package-features">Itens incluídos</Label>
                    <textarea
                      id="package-features"
                      rows={5}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={listToText(packageForm.features)}
                      onChange={(event) => updatePackageForm('features', textToList(event.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="package-not-included">Itens não incluídos</Label>
                    <textarea
                      id="package-not-included"
                      rows={3}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={listToText(packageForm.notIncluded)}
                      onChange={(event) => updatePackageForm('notIncluded', textToList(event.target.value))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={packageForm.popular}
                        onChange={(event) => updatePackageForm('popular', event.target.checked)}
                      />
                      Popular
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={packageForm.isActive}
                        onChange={(event) => updatePackageForm('isActive', event.target.checked)}
                      />
                      Ativo
                    </label>
                  </div>

                  <Button onClick={handleSavePackage} disabled={isSavingPackage} className="w-full">
                    {isSavingPackage ? 'Salvando...' : 'Salvar Pacote'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Adicionais</CardTitle>
                    <Button size="sm" variant="outline" onClick={handleNewAddon}>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {addons.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum adicional cadastrado.</p>
                  ) : (
                    addons.map((addon) => (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleSelectAddon(addon)}
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          selectedAddonId === addon.id ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{addon.name}</p>
                            <p className="line-clamp-2 text-sm text-gray-500">{addon.description || 'Sem descrição'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{formatCurrency(addon.price)}</p>
                            <p className={`text-xs ${addon.isActive === false ? 'text-red-600' : 'text-green-600'}`}>
                              {addon.isActive === false ? 'Inativo' : 'Ativo'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{selectedAddonId ? 'Editar Adicional' : 'Novo Adicional'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="addon-name">Nome</Label>
                    <Input
                      id="addon-name"
                      value={addonForm.name}
                      onChange={(event) => updateAddonForm('name', event.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addon-price">Preço</Label>
                    <Input
                      id="addon-price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={addonForm.price}
                      onChange={(event) => updateAddonForm('price', Number(event.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="addon-description">Descrição</Label>
                    <textarea
                      id="addon-description"
                      rows={3}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={addonForm.description}
                      onChange={(event) => updateAddonForm('description', event.target.value)}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={addonForm.isActive}
                      onChange={(event) => updateAddonForm('isActive', event.target.checked)}
                    />
                    Ativo
                  </label>

                  <Button onClick={handleSaveAddon} disabled={isSavingAddon} className="w-full">
                    {isSavingAddon ? 'Salvando...' : 'Salvar Adicional'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {bookingToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-red-700">
                    <XCircle className="w-5 h-5 mr-2" />
                    Excluir Reserva
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setBookingToDelete(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Esta ação remove permanentemente a reserva de <strong>{bookingToDelete.customer}</strong>.
                </p>
                <div className="rounded-lg bg-gray-50 p-4 text-sm">
                  <p><strong>Data:</strong> {bookingToDelete.date ? formatDate(parseBookingDate(bookingToDelete.date)) : 'Data não disponível'}</p>
                  <p><strong>Pacote:</strong> {bookingToDelete.packageName}</p>
                  <p><strong>Valor:</strong> {formatCurrency(bookingToDelete.total)}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setBookingToDelete(null)}>
                    Cancelar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => deleteBooking(bookingToDelete)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Excluir definitivamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Detalhes da Reserva */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-hidden border-slate-200 shadow-xl">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="flex items-center text-slate-950">
                    <User className="w-5 h-5 mr-2" />
                    Detalhes da Reserva
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsDetailsModalOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[calc(90vh-84px)] space-y-5 overflow-y-auto p-6">
                {/* Cliente */}
                <div className="border-b pb-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold">
                    <span className="flex items-center text-slate-950">
                      <User className="w-5 h-5 mr-2 text-primary" />
                      {selectedBooking.customer}
                    </span>
                    <CustomBriefingBadge notes={selectedBooking.notes} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{selectedBooking.email || 'Email não informado'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{selectedBooking.phone || 'Telefone não informado'}</span>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Evento */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Informações do Evento</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                        Data:
                      </span>
                      <span className="font-medium">
                        {selectedBooking.date ? formatDate(parseBookingDate(selectedBooking.date)) : 'Data não disponível'}
                      </span>
                    </div>
                    
	                    <div className="flex items-center justify-between">
	                      <span className="flex items-center">
	                        <Users className="w-4 h-4 mr-2 text-gray-500" />
	                        Convidados:
	                      </span>
	                      <span className="font-medium">{selectedBooking.guests} pessoas</span>
	                    </div>

	                    <div className="flex items-center justify-between">
	                      <span>Pacote:</span>
	                      <span className="font-medium">{selectedBooking.packageName}</span>
	                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                        Valor:
                      </span>
                      <span className="font-medium">{formatCurrency(selectedBooking.total)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                  </div>
                </div>

                <BookingNotesPanel notes={selectedBooking.notes} />
                <BookingAddonsPanel addons={selectedBooking.addons} />

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      {selectedBooking.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus(selectedBooking.id, 'REJECTED')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Recusar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </>
                      )}
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(selectedBooking.id, 'COMPLETED')}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setBookingToDelete(selectedBooking)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Excluir Reserva
                      </Button>
                    </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
