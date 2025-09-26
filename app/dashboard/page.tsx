'use client'

import { useState, useEffect } from 'react'
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
  BarChart3,
  Eye,
  User,
  Mail,
  Phone,
  MessageSquare,
  X
} from 'lucide-react'
import { formatCurrency, formatDate, parseLocalDate } from '@/lib/utils'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Função para converter data recebida de string do JSON para Date object
  const parseBookingDate = (date: any): Date => {
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
      } else if (date && typeof date === 'object' && date.toISOString) {
        // Se é um objeto com método toISOString (como vem do Prisma)
        return isNaN(new Date(date).getTime()) ? new Date() : new Date(date)
      } else {
        const parsed = new Date(date)
        return isNaN(parsed.getTime()) ? new Date() : parsed
      }
    } catch (error) {
      console.error('Error parsing date:', date, error)
      return new Date()
    }
  }

  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
  })

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Erro ao carregar dados')
      const data = await res.json()
      setRecentBookings(data.recentBookings)
      setStats(data.stats)
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

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

  const showBookingDetails = (booking: any) => {
    setSelectedBooking(booking)
    setIsDetailsModalOpen(true)
  }

  const updateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
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
                          <p className="font-medium">{booking.packageId}</p>
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
                                onClick={() => updateStatus(booking.id, 'CANCELLED')}
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
                {selectedBooking.status === 'pending' && (
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
