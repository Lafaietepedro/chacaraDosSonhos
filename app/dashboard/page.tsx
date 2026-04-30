'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/calendar'
import { LoginForm } from '@/components/auth/login-form'
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
  X,
  LogOut,
  Search
} from 'lucide-react'
import { formatCurrency, formatDate, parseLocalDate } from '@/lib/utils'
import { siteConfig } from '@/lib/site'
import type {
  CatalogResponse,
  DashboardBlockedDate,
  DashboardBooking,
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

type BookingFilterState = {
  search: string
  status: string
  from: string
  to: string
}

const emptyBookingFilters: BookingFilterState = {
  search: '',
  status: 'all',
  from: '',
  to: '',
}

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

export default function DashboardPage() {
  const { isAuthenticated, isLoading, login, logout, getToken } = useAuth()
  const authRef = useRef({ getToken, logout })
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [blockedDates, setBlockedDates] = useState<DashboardBlockedDate[]>([])
  const [selectedBooking, setSelectedBooking] = useState<DashboardBooking | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [propertySettings, setPropertySettings] = useState<PropertySettingsInput>(defaultPropertySettings)
  const [packages, setPackages] = useState<PackageOption[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [packageForm, setPackageForm] = useState<PackageSettingsInput>(emptyPackageForm)
  const [bookingFilters, setBookingFilters] = useState<BookingFilterState>(emptyBookingFilters)
  const [filterDraft, setFilterDraft] = useState<BookingFilterState>(emptyBookingFilters)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [isSavingPackage, setIsSavingPackage] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    authRef.current = { getToken, logout }
  }, [getToken, logout])

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = authRef.current.getToken()
      const params = new URLSearchParams()

      if (bookingFilters.search.trim()) params.set('search', bookingFilters.search.trim())
      if (bookingFilters.status !== 'all') params.set('status', bookingFilters.status)
      if (bookingFilters.from) params.set('from', bookingFilters.from)
      if (bookingFilters.to) params.set('to', bookingFilters.to)

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
      const data = await res.json() as { recentBookings: DashboardBooking[]; stats: DashboardStats }
      setRecentBookings(data.recentBookings)
      setStats(data.stats)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    }
  }, [bookingFilters])

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
      fetchPropertySettings()
    }
  }, [fetchBlockedDates, fetchDashboardData, fetchPropertySettings, isAuthenticated])

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
    } catch (error) {
      console.error(error)
      alert('Não foi possível bloquear a data. Tente novamente.')
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
    } catch (error) {
      console.error(error)
      alert('Não foi possível desbloquear a data. Tente novamente.')
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
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Não foi possível salvar as configurações.')
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

  const updatePackageForm = <Key extends keyof PackageSettingsInput>(
    key: Key,
    value: PackageSettingsInput[Key]
  ) => {
    setPackageForm((current) => ({ ...current, [key]: value }))
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
      alert('Pacote salvo com sucesso!')
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Não foi possível salvar o pacote.')
    } finally {
      setIsSavingPackage(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('A confirmação precisa ser igual à nova senha.')
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
      alert('Senha alterada com sucesso!')
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Não foi possível alterar a senha.')
    } finally {
      setIsChangingPassword(false)
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'cancelled':
        return 'Cancelado'
      case 'rejected':
        return 'Recusado'
      default:
        return 'Desconhecido'
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
    setBookingFilters(filterDraft)
  }

  const clearBookingFilters = () => {
    setFilterDraft(emptyBookingFilters)
    setBookingFilters(emptyBookingFilters)
  }

      const updateStatus = async (id: string, status: 'CONFIRMED' | 'REJECTED') => {
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
          if (!res.ok) throw new Error('Falha ao atualizar')
          
          // Recarregar dados do dashboard
          await fetchDashboardData()
          setIsDetailsModalOpen(false)
        } catch (e) {
          console.error(e)
          alert('Não foi possível atualizar o status. Tente novamente.')
        }
      }

      const deleteBooking = async (id: string, customerName: string) => {
        if (!confirm(`Tem certeza que deseja excluir a reserva de ${customerName}? Esta ação não pode ser desfeita.`)) {
          return
        }

        try {
          const token = getToken()
          const res = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`
            },
          })
          
          if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Falha ao excluir')
          }
          
          const result = await res.json()
          console.log('Reserva excluída:', result.deletedBooking)
          
          // Recarregar dados do dashboard
          await fetchDashboardData()
          setIsDetailsModalOpen(false)
          
          alert('Reserva excluída com sucesso!')
        } catch (e) {
          console.error(e)
          alert(`Não foi possível excluir a reserva. ${e instanceof Error ? e.message : 'Tente novamente.'}`)
        }
      }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel do Anfitrião</h1>
              <p className="text-gray-600">Acompanhe solicitações, agenda e indicadores do espaço</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Reserva
              </Button>
              <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'bookings', label: 'Reservas', icon: CalendarIcon },
            { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CalendarIcon className="w-8 h-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(booking.status)}
                        <div>
                        <p className="font-medium">{booking.customer}</p>
                      <p className="text-sm text-gray-600">
                        {booking.date ? formatDate(parseBookingDate(booking.date)) : 'Data não disponível'} • {booking.guests} pessoas
                      </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-semibold">{formatCurrency(booking.total)}</p>
                        <p className="text-sm text-gray-600">{getStatusText(booking.status)}</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border bg-gray-50 p-4 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr_auto]">
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

                <p className="mb-4 text-sm text-gray-500">
                  Mostrando {recentBookings.length} {recentBookings.length === 1 ? 'reserva' : 'reservas'}
                </p>

                <div className="space-y-4">
                  {recentBookings.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">
                      Nenhuma reserva encontrada para os filtros selecionados.
                    </div>
                  ) : recentBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.customer}</h3>
                          <p className="text-sm text-gray-500">{booking.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <span className="text-sm font-medium">{getStatusText(booking.status)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Data</p>
                          <p className="font-medium">{booking.date ? formatDate(parseBookingDate(booking.date)) : 'Data não disponível'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Convidados</p>
                          <p className="font-medium">{booking.guests} pessoas</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pacote</p>
	                          <p className="font-medium">{booking.packageName}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(booking.total)}
                        </div>
                            <div className="flex space-x-2">
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
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar
                                  </Button>
                                </>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteBooking(booking.id, booking.customer)}
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
	                      <p className="text-gray-500 text-sm">Nenhuma data bloqueada</p>
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
            </div>
          </div>
        )}

        {/* Modal de Detalhes da Reserva */}
        {isDetailsModalOpen && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
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
              <CardContent className="space-y-4">
                {/* Cliente */}
                <div className="border-b pb-4">
                  <div className="flex items-center text-lg font-semibold mb-2">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    {selectedBooking.customer}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedBooking.notes && selectedBooking.notes.trim() && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <div className="flex items-start text-sm">
                      <MessageSquare className="w-4 h-4 mr-2 text-gray-500 mt-0.5" />
                      <span className="text-gray-600">{selectedBooking.notes}</span>
                    </div>
                  </div>
                )}

                    {/* Botões de Ação */}
                    <div className="flex space-x-2 pt-4">
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
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteBooking(selectedBooking.id, selectedBooking.customer)}
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
