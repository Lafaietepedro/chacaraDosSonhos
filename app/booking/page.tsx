'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Users, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [dateError, setDateError] = useState('')
  const [guests, setGuests] = useState(50)
  const [selectedPackage, setSelectedPackage] = useState('completo')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [showSuccess, setShowSuccess] = useState(false)

  const packages = [
    {
      id: 'basico',
      name: 'Básico',
      price: 800,
      duration: '8 horas',
      capacity: 50,
      extraPerGuest: 20,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi']
    },
    {
      id: 'completo',
      name: 'Completo',
      price: 1200,
      duration: '12 horas',
      capacity: 100,
      extraPerGuest: 18,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi', 'Limpeza incluída', 'Som básico']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1800,
      duration: '24 horas',
      capacity: 150,
      extraPerGuest: 15,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi', 'Limpeza incluída', 'Som ambiente', 'Decoração básica']
    }
  ]

  const CLEANING_FEE = 150

  const currentPackage = packages.find(pkg => pkg.id === selectedPackage)!
  const extraGuests = Math.max(0, guests - currentPackage.capacity)
  const extraGuestsCost = extraGuests * (currentPackage as any).extraPerGuest
  const totalPrice = currentPackage.price + CLEANING_FEE + extraGuestsCost

  // No extras toggling anymore

  const handleNext = () => {
    if (step === 1) {
      if (!selectedDate) {
        setDateError('Por favor, selecione a data do evento para continuar.')
        return
      }
      setDateError('')
    }
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    const payload = {
      date: selectedDate,
      guests,
      packageId: selectedPackage,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        notes: customerInfo.notes,
      },
      totalPrice,
    }

    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          let detail = ''
          try {
            const data = await res.json()
            detail = data?.error || JSON.stringify(data)
          } catch (_) {}
          throw new Error(detail || 'Falha ao registrar a reserva')
        }
        setShowSuccess(true)
        setTimeout(() => router.push('/'), 2500)
      })
      .catch((err) => {
        console.error(err)
        alert(`Ocorreu um erro ao enviar sua reserva. ${err?.message || ''}`)
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {showSuccess && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 shadow-sm">
              <div className="flex items-start">
                <div className="mr-3 mt-0.5 h-4 w-4 rounded-full bg-green-500" />
                <div>
                  <p className="font-semibold">Reserva enviada com sucesso!</p>
                  <p className="text-sm opacity-90">Entraremos em contato para confirmação. Você será redirecionado para a página inicial em instantes.</p>
                </div>
              </div>
            </div>
          )}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Fazer Reserva
            </h1>
            <p className="text-xl text-gray-600">
              Preencha as informações abaixo para reservar sua data
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {step === 1 && 'Selecione a Data e Número de Convidados'}
                    {step === 2 && 'Escolha o Pacote'}
                    {step === 3 && 'Informações do Cliente'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Date and Guests */}
                  {step === 1 && (
                    <>
                      <div>
                        <Label htmlFor="date">Data do Evento *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value)
                            if (e.target.value) setDateError('')
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        {dateError && (
                          <p className="mt-1 text-sm text-red-600">{dateError}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="guests">Número de Convidados *</Label>
                        <div className="mt-2 flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-500" />
                          <Input
                            id="guests"
                            type="number"
                            min={1}
                            max={500}
                            value={guests}
                            onChange={(e) => {
                              const value = parseInt(e.target.value || '0', 10)
                              if (Number.isNaN(value)) {
                                setGuests(1)
                              } else {
                                const clamped = Math.max(1, Math.min(500, value))
                                setGuests(clamped)
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Até {currentPackage.capacity} pessoas incluídas no pacote {currentPackage.name}. Convidados extras: {formatCurrency((currentPackage as any).extraPerGuest)} por pessoa.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Step 2: Package Selection */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPackage === pkg.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPackage(pkg.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{pkg.name}</h3>
                              <p className="text-gray-600">{pkg.duration} • Até {pkg.capacity} pessoas</p>
                              <ul className="mt-2 space-y-1">
                                {pkg.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500 mr-2" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {formatCurrency(pkg.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 3: Extras */}
                  {/* No extras step anymore */}

                  {/* Step 4: Customer Info */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Observações</Label>
                        <textarea
                          id="notes"
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Alguma observação especial sobre o evento?"
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      disabled={step === 1}
                    >
                      Voltar
                    </Button>
                    {step < 3 ? (
                      <Button onClick={handleNext} disabled={step === 1 && !selectedDate}>
                        Próximo
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit}>
                        Finalizar Reserva
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo da Reserva</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedDate && (
                    <div>
                      <h4 className="font-medium text-gray-900">Data</h4>
                      <p className="text-gray-600">
                        {new Date(selectedDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Convidados</h4>
                    <p className="text-gray-600">{guests} pessoas</p>
                  </div>

                  {selectedPackage && (
                    <div>
                      <h4 className="font-medium text-gray-900">Pacote</h4>
                      <p className="text-gray-600">{currentPackage.name}</p>
                      <p className="text-sm text-gray-500">{currentPackage.duration}</p>
                      <p className="text-xs text-gray-500">Até {currentPackage.capacity} pessoas • {formatCurrency((currentPackage as any).extraPerGuest)} por convidado extra</p>
                    </div>
                  )}

                  {/* No extras list in summary */}

                  <div>
                    <h4 className="font-medium text-gray-900">Taxa de Limpeza</h4>
                    <p className="text-sm text-gray-600">{formatCurrency(CLEANING_FEE)} (obrigatória)</p>
                  </div>

                  {extraGuests > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Convidados Extras</h4>
                      <p className="text-sm text-gray-600">
                        {extraGuests} x {formatCurrency((currentPackage as any).extraPerGuest)} = {formatCurrency(extraGuestsCost)}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-xl text-primary">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      * Preço sujeito a confirmação
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
