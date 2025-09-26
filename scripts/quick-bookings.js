const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickView() {
  try {
    console.log('🔍 Reservas recentes:\n')

    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        startDate: true,
        guests: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    if (bookings.length === 0) {
      console.log('❌ Nenhuma reserva encontrada.')
      return
    }

    console.log('ID'.padEnd(12) + 'Data'.padEnd(12) + 'Cliente'.padEnd(20) + 'Convidados'.padEnd(10) + 'Valor'.padEnd(10) + 'Status')
    console.log('─'.repeat(80))

    bookings.forEach(booking => {
      const date = booking.startDate.toLocaleDateString('pt-BR')
      const client = booking.user.name.substring(0, 18)
      const value = `R$ ${booking.totalPrice.toFixed(2)}`
      
      console.log(
        booking.id.substring(0, 8).padEnd(12) +
        date.padEnd(12) +
        client.padEnd(20) +
        booking.guests.toString().padEnd(10) +
        value.padEnd(10) +
        booking.status
      )
    })

  } catch (error) {
    console.error('❌ Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

quickView()
