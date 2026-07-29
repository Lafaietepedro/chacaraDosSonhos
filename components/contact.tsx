'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Clock, Mail, MessageCircle, Phone } from 'lucide-react'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'

const contactInfo = [
  ...(siteConfig.phone
    ? [{ icon: Phone, title: 'Telefone', info: siteConfig.phone, description: 'WhatsApp disponível' }]
    : []),
  { icon: Mail, title: 'Email', info: siteConfig.email, description: 'Contato da LPeM Software' },
  { icon: Building2, title: 'Projeto', info: 'Demonstração funcional', description: 'Solução criada pela LPeM Software' },
  { icon: Clock, title: 'Atendimento', info: 'Solicitação online', description: 'Painel disponível 24h' },
]

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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
      if (!response.ok) throw new Error(data?.error || 'Não foi possível enviar a mensagem')

      setStatus('success')
      setFeedback('Mensagem enviada com sucesso. O contato ficou registrado no painel.')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      setStatus('error')
      setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero falar sobre uma reserva pelo ${siteConfig.appName}.`)

  return (
    <section id="contact" className="bg-slate-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-300">Contato</p>
            <h2 className="mt-3 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Transforme cada contato em uma oportunidade organizada.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Nesta demonstração, as mensagens são registradas no painel para mostrar como a equipe acompanha cada oportunidade sem depender de planilhas ou conversas dispersas.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {contactInfo.map((item) => (
                <div key={item.title} className="rounded-md border border-white/10 bg-white/[0.06] p-4">
                  <item.icon className="mb-3 h-5 w-5 text-emerald-300" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium text-amber-100">{item.info}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>

            {whatsappUrl ? (
              <Button className="mt-8 bg-white text-slate-950 hover:bg-slate-100" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Abrir WhatsApp
                </a>
              </Button>
            ) : (
              <Button className="mt-8 bg-white text-slate-950 hover:bg-slate-100" asChild>
                <a href={`mailto:${siteConfig.email}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  Falar com a LPeM
                </a>
              </Button>
            )}
          </div>

          <Card className="border-white/10 bg-white text-slate-950 shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-2xl font-bold">Enviar mensagem</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Registre dúvidas, disponibilidade e detalhes iniciais do evento.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} />
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
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Conte sobre data, número de convidados e tipo de evento."
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
                  {status === 'sending' ? 'Enviando...' : 'Registrar contato'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
