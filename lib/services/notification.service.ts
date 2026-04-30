import { Resend } from 'resend'
import type { Booking, BookingPackage, Property, User } from '@prisma/client'
import { notifyWhatsAppHost } from '@/lib/notify'
import { siteConfig } from '@/lib/site'

type BookingWithRelations = Booking & {
  user: User
  property: Property
  package: BookingPackage | null
}

type BookingNotificationInput = {
  booking: BookingWithRelations
  packageName: string
  totalAmount: number
}

type NotificationResult = {
  clientEmailSent: boolean
  hostEmailSent: boolean
  whatsappSent: boolean
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  return apiKey ? new Resend(apiKey) : null
}

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || `${siteConfig.appName} <onboarding@resend.dev>`
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function buildBookingSummary({ booking, packageName, totalAmount }: BookingNotificationInput) {
  return {
    date: formatDate(booking.startDate),
    guests: booking.guests,
    total: formatCurrency(totalAmount),
    packageName,
    customerName: booking.user.name,
    customerPhone: booking.user.phone || 'Não informado',
    customerEmail: booking.user.email,
    notes: booking.notes,
    venueName: booking.property.name,
  }
}

async function sendEmail(to: string | null | undefined, subject: string, text: string) {
  const resend = getResendClient()
  if (!resend || !to) return false

  try {
    const response = await resend.emails.send({
      from: getFromAddress(),
      to,
      subject,
      text,
    })

    if (response.error) {
      console.error('Erro ao enviar email transacional:', response.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Falha ao enviar email transacional:', error)
    return false
  }
}

export async function notifyBookingCreated(input: BookingNotificationInput): Promise<NotificationResult> {
  const summary = buildBookingSummary(input)
  const hostEmail = input.booking.property.contactEmail || siteConfig.email

  const hostMessage = `Nova solicitação de reserva - ${siteConfig.appName}

Espaço: ${summary.venueName}
Data: ${summary.date}
Convidados: ${summary.guests}
Valor: ${summary.total}
Pacote: ${summary.packageName}
Cliente: ${summary.customerName}
Telefone: ${summary.customerPhone}
Email: ${summary.customerEmail}
${summary.notes ? `Observações: ${summary.notes}` : ''}

Reserva criada no sistema!`

  const clientMessage = `Olá, ${summary.customerName}.

Recebemos sua solicitação de reserva para ${summary.venueName}.

Data: ${summary.date}
Convidados: ${summary.guests}
Pacote: ${summary.packageName}
Valor estimado: ${summary.total}

O anfitrião vai analisar a solicitação e retornar com a confirmação.`

  const [clientEmailSent, hostEmailSent, whatsappSent] = await Promise.all([
    sendEmail(summary.customerEmail, `Solicitação recebida - ${siteConfig.appName}`, clientMessage),
    sendEmail(hostEmail, `Nova reserva pendente - ${summary.customerName}`, hostMessage),
    notifyWhatsAppHost(hostMessage),
  ])

  return {
    clientEmailSent,
    hostEmailSent,
    whatsappSent,
  }
}
