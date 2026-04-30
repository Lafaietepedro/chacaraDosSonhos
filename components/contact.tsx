'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setStatus('sending')
      setFeedback('')

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data?.error || 'Não foi possível enviar a mensagem')
      }

      setStatus('success')
      setFeedback('Mensagem enviada com sucesso. Entraremos em contato em breve.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero falar sobre uma reserva pelo ${siteConfig.appName}.`)

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefone',
      info: siteConfig.phone,
      description: 'WhatsApp disponível'
    },
    {
      icon: Mail,
      title: 'Email',
      info: siteConfig.email,
      description: 'Resposta em até 24h'
    },
    {
      icon: MapPin,
      title: 'Endereço',
      info: siteConfig.address,
      description: siteConfig.city
    },
    {
      icon: Clock,
      title: 'Horário',
      info: '24h por dia',
      description: '7 dias por semana'
    }
  ]

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Entre em Contato
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tire dúvidas, valide disponibilidade ou use o fluxo de reserva para enviar uma solicitação completa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Envie sua Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Conte-nos sobre seu evento..."
                  />
                </div>

                {feedback && (
                  <div
                    className={`rounded-md border px-3 py-2 text-sm ${
                      status === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    {feedback}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-lg text-primary font-medium mb-1">
                        {item.info}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* WhatsApp CTA */}
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Resposta Rápida
                </h3>
                <p className="text-gray-600 mb-4">
                  Para dúvidas urgentes, fale conosco no WhatsApp
                </p>
                <Button asChild>
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
