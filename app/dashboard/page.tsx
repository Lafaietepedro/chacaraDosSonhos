'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/calendar'
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
  BarChart3
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [blockedDates, setBlockedDates] = useState<Date[]>([])

  // Mock data - em produção viria do banco de dados
  const stats = {
    totalBookings: 24,
    pendingBookings: 3,
    confirmedBookings: 18,
    cancelledBookings: 3,
    monthlyRevenue: 14400,
    occupancyRate: 75
  }

  const recentBookings = [
    {
      id: 'CHC-001',
      customer: 'Maria Silva',
      date: '2024-02-15',
      guests: 80,
      package: 'Completo',
      status: 'pending',
      total: 1200
    },
    {
      id: 'CHC-002',
      customer: 'João Santos',
      date: '2024-02-20',
      guests: 120,
      package: 'Premium',
      status: 'confirmed',
      total: 1800
    },
    {
      id: 'CHC-003',
      customer: 'Ana Costa',
      date: '2024-02-25',
      guests: 60,
      package: 'Básico',
      status: 'confirmed',
      total: 800
    }
  ]

  const handleBlockDate = () => {
    if (selectedDate) {
      setBlockedDates(prev => [...prev, selectedDate])
      setSelectedDate(undefined)
    }
  }

  const handleUnblockDate = (date: Date) => {
    setBlockedDates(prev => prev.filter(d => d.getTime() !== date.getTime()))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'cancelled':
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
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel do Host</h1>
              <p className="text-gray-600">Gerencie suas reservas e configurações</p>
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
                            {booking.id} • {formatDate(new Date(booking.date))} • {booking.guests} pessoas
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(booking.total)}</p>
                        <p className="text-sm text-gray-600">{getStatusText(booking.status)}</p>
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
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{booking.customer}</h3>
                          <p className="text-gray-600">{booking.id}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(booking.status)}
                          <span className="text-sm font-medium">{getStatusText(booking.status)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Data</p>
                          <p className="font-medium">{formatDate(new Date(booking.date))}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Convidados</p>
                          <p className="font-medium">{booking.guests} pessoas</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pacote</p>
                          <p className="font-medium">{booking.package}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(booking.total)}
                        </div>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline">
                                <XCircle className="w-4 h-4 mr-2" />
                                Recusar
                              </Button>
                              <Button size="sm">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Aprovar
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline">
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

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Calendar
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
                blockedDates={blockedDates}
                bookings={recentBookings.map(booking => ({
                  startDate: new Date(booking.date),
                  endDate: new Date(booking.date),
                  status: booking.status as 'confirmed' | 'pending' | 'blocked'
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
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
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
                      blockedDates.map((date, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{formatDate(date)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblockDate(date)}
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
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Chácara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="property-name">Nome da Propriedade</Label>
                  <Input id="property-name" defaultValue="Chácara dos Sonhos" />
                </div>
                
                <div>
                  <Label htmlFor="base-price">Preço Base (R$)</Label>
                  <Input id="base-price" type="number" defaultValue="800" />
                </div>
                
                <div>
                  <Label htmlFor="capacity">Capacidade Máxima</Label>
                  <Input id="capacity" type="number" defaultValue="150" />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    defaultValue="Chácara perfeita para seus eventos especiais..."
                  />
                </div>
                
                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
