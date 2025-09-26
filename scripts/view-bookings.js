const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function viewBookings() {
  try {
    console.log('🔍 Buscando reservas no banco de dados...\n')

    // Buscar todas as reservas com informações do usuário
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        property: true,
        payments: true,
        bookingExtras: {
          include: {
            extra: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (bookings.length === 0) {
      console.log('❌ Nenhuma reserva encontrada no banco de dados.')
      return
    }

    console.log(`✅ Encontradas ${bookings.length} reserva(s):\n`)

    bookings.forEach((booking, index) => {
      console.log(`📋 RESERVA ${index + 1}:`)
      console.log(`   ID: ${booking.id}`)
      console.log(`   Data: ${booking.startDate.toLocaleDateString('pt-BR')}`)
      console.log(`   Convidados: ${booking.guests}`)
      console.log(`   Valor Total: R$ ${booking.totalPrice.toFixed(2)}`)
      console.log(`   Status: ${booking.status}`)
      console.log(`   Criada em: ${booking.createdAt.toLocaleString('pt-BR')}`)
      
      if (booking.notes) {
        console.log(`   Observações: ${booking.notes}`)
      }

      console.log(`   👤 CLIENTE:`)
      console.log(`      Nome: ${booking.user.name}`)
      console.log(`      Email: ${booking.user.email}`)
      console.log(`      Telefone: ${booking.user.phone || 'Não informado'}`)

      console.log(`   🏡 PROPRIEDADE:`)
      console.log(`      Nome: ${booking.property.name}`)
      console.log(`      Endereço: ${booking.property.address}`)

      if (booking.payments.length > 0) {
        console.log(`   💳 PAGAMENTOS:`)
        booking.payments.forEach((payment, pIndex) => {
          console.log(`      ${pIndex + 1}. R$ ${payment.amount.toFixed(2)} - ${payment.status} (${payment.method})`)
        })
      }

      if (booking.bookingExtras.length > 0) {
        console.log(`   ➕ EXTRAS:`)
        booking.bookingExtras.forEach((extra, eIndex) => {
          console.log(`      ${eIndex + 1}. ${extra.extra.name} - R$ ${extra.extra.price.toFixed(2)} x${extra.quantity}`)
        })
      }

      console.log('   ' + '─'.repeat(50))
    })

    // Estatísticas gerais
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('\n📊 ESTATÍSTICAS:')
    stats.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status} reserva(s)`)
    })

    const totalRevenue = await prisma.booking.aggregate({
      _sum: {
        totalPrice: true
      }
    })

    console.log(`   💰 Receita Total: R$ ${(totalRevenue._sum.totalPrice || 0).toFixed(2)}`)

  } catch (error) {
    console.error('❌ Erro ao buscar reservas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
viewBookings()
