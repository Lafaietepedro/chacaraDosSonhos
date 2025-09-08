'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Users, Plus, Minus, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [guests, setGuests] = useState(50)
  const [selectedPackage, setSelectedPackage] = useState('completo')
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const packages = [
    {
      id: 'basico',
      name: 'Básico',
      price: 800,
      duration: '8 horas',
      capacity: 50,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi']
    },
    {
      id: 'completo',
      name: 'Completo',
      price: 1200,
      duration: '12 horas',
      capacity: 100,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi', 'Limpeza incluída', 'Som básico']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1800,
      duration: '24 horas',
      capacity: 150,
      features: ['Acesso à chácara', 'Churrasqueira', 'Estacionamento', 'Wi-Fi', 'Limpeza incluída', 'Som profissional', 'Decoração básica']
    }
  ]

  const extras = [
    { id: 'limpeza', name: 'Limpeza pós-evento', price: 150 },
    { id: 'decoracao', name: 'Decoração básica', price: 200 },
    { id: 'som', name: 'Sistema de som profissional', price: 300 },
    { id: 'piscina', name: 'Piscina (temporada)', price: 100 },
    { id: 'seguranca', name: 'Segurança adicional', price: 250 },
    { id: 'cozinheiro', name: 'Cozinheiro/Churrasqueiro', price: 400 }
  ]

  const currentPackage = packages.find(pkg => pkg.id === selectedPackage)!
  const selectedExtrasData = extras.filter(extra => selectedExtras.includes(extra.id))
  const extrasTotal = selectedExtrasData.reduce((sum, extra) => sum + extra.price, 0)
  const totalPrice = currentPackage.price + extrasTotal

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    )
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    // Aqui você implementaria o envio da reserva
    console.log('Booking submitted:', {
      date: selectedDate,
      guests,
      package: selectedPackage,
      extras: selectedExtras,
      customerInfo,
      totalPrice
    })
    alert('Reserva enviada com sucesso! Entraremos em contato para confirmação.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
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
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
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
                    {step === 3 && 'Adicione Extras (Opcional)'}
                    {step === 4 && 'Informações do Cliente'}
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
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label>Número de Convidados *</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests(Math.max(10, guests - 10))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center space-x-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            <span className="text-lg font-medium">{guests} pessoas</span>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setGuests(Math.min(150, guests + 10))}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
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
                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Adicione serviços extras para tornar seu evento ainda mais especial:
                      </p>
                      {extras.map((extra) => (
                        <div
                          key={extra.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedExtras.includes(extra.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleExtraToggle(extra.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{extra.name}</h3>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-primary">
                                {formatCurrency(extra.price)}
                              </span>
                              {selectedExtras.includes(extra.id) && (
                                <Check className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 4: Customer Info */}
                  {step === 4 && (
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
                    {step < 4 ? (
                      <Button onClick={handleNext}>
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
                    </div>
                  )}

                  {selectedExtras.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Extras</h4>
                      <ul className="space-y-1">
                        {selectedExtrasData.map((extra) => (
                          <li key={extra.id} className="text-sm text-gray-600">
                            {extra.name}
                          </li>
                        ))}
                      </ul>
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
