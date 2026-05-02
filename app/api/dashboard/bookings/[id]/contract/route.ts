import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/api-auth'
import { createSimplePdf } from '@/lib/pdf/simple-pdf'
import { formatCurrency, formatDate } from '@/lib/utils'

const bookingStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Recusada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Concluída',
}

const quoteStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
}

type BookingForContract = Prisma.BookingGetPayload<{
  include: {
    user: true
    property: true
    package: true
    bookingExtras: {
      include: { extra: true }
    }
    customQuote: {
      include: {
        items: true
      }
    }
  }
}>

function formatOptional(value: string | null | undefined) {
  return value?.trim() || 'Não informado'
}

function createContractLines(booking: BookingForContract) {
  const selectedAddons = booking.bookingExtras.map((bookingExtra) => ({
    name: bookingExtra.extra.name,
    quantity: bookingExtra.quantity,
    total: bookingExtra.extra.price * bookingExtra.quantity,
  }))
  const quoteAmount = booking.customQuote?.finalAmount ?? booking.customQuote?.estimatedAmount ?? booking.totalPrice

  return [
    'Resumo',
    `Reserva: ${booking.id}`,
    `Status da reserva: ${bookingStatusLabels[booking.status] ?? booking.status}`,
    `Espaço: ${booking.property.name}`,
    `Data do evento: ${formatDate(booking.startDate)}`,
    `Cliente: ${booking.user.name}`,
    `Email: ${formatOptional(booking.user.email)}`,
    `Telefone: ${formatOptional(booking.user.phone)}`,
    '',
    'Evento e pacote',
    `Pacote contratado: ${booking.packageNameSnapshot || booking.package?.name || 'Pacote não informado'}`,
    `Convidados previstos: ${booking.guests}`,
    `Convidados extras: ${booking.extraGuests}`,
    `Preço base registrado: ${formatCurrency(booking.basePriceSnapshot)}`,
    `Taxa operacional registrada: ${formatCurrency(booking.operationalFeeSnapshot)}`,
    `Valor total da reserva: ${formatCurrency(booking.totalPrice)}`,
    '',
    'Adicionais',
    ...(selectedAddons.length > 0
      ? selectedAddons.map((addon) => `${addon.quantity}x ${addon.name}: ${formatCurrency(addon.total)}`)
      : ['Nenhum adicional selecionado.']),
    '',
    'Proposta sob medida',
    ...(booking.customQuote ? [
      `Status da proposta: ${quoteStatusLabels[booking.customQuote.status] ?? booking.customQuote.status}`,
      `Valor da proposta: ${formatCurrency(quoteAmount)}`,
      `Tipo de evento: ${formatOptional(booking.customQuote.eventType)}`,
      `Duração desejada: ${formatOptional(booking.customQuote.desiredDuration)}`,
      `Faixa de investimento: ${formatOptional(booking.customQuote.budgetRange)}`,
      `Necessidades principais: ${formatOptional(booking.customQuote.requirements)}`,
      ...booking.customQuote.items.map((item) =>
        `${item.label}: ${item.quantity} ${item.unit} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`
      ),
    ] : ['Reserva sem proposta sob medida vinculada.']),
    '',
    'Observações',
    formatOptional(booking.notes),
    '',
    'Condições operacionais',
    '1. Este documento consolida os dados registrados no painel administrativo da Venue Eventos.',
    '2. A confirmação operacional depende da aprovação do anfitrião e, quando aplicável, da quitação do sinal.',
    '3. Alterações de escopo, horário, convidados ou adicionais podem exigir revisão do valor final.',
    '4. Regras específicas do espaço, caução, horários de montagem e política de cancelamento devem ser anexadas pelo operador.',
    '',
    `Documento gerado em ${formatDate(new Date())}.`,
  ]
}

async function getBookingForContract(id: string) {
  if (!prisma) return null

  return prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      property: true,
      package: true,
      bookingExtras: {
        include: { extra: true },
      },
      customQuote: {
        include: {
          items: {
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = verifyAuth(request)
  if (!authResult.success) {
    return NextResponse.json({ error: authResult.error }, { status: 401 })
  }

  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { id } = await params
  const booking = await getBookingForContract(id)

  if (!booking) {
    return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })
  }

  const pdf = createSimplePdf({
    title: 'Proposta e contrato - Venue Eventos',
    subtitle: `Reserva ${booking.id}`,
    lines: createContractLines(booking),
  })

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="venue-eventos-contrato-${booking.id}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
