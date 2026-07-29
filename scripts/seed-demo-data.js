#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const demoUsers = [
  {
    name: 'Marina Costa',
    email: 'marina.costa@venue.demo',
    phone: '(61) 98888-1401',
  },
  {
    name: 'Rafael Lima',
    email: 'rafael.lima@venue.demo',
    phone: '(61) 97777-2202',
  },
  {
    name: 'Bianca Martins',
    email: 'bianca.martins@venue.demo',
    phone: '(61) 96666-3303',
  },
  {
    name: 'Grupo Aurora',
    email: 'eventos@aurora.demo',
    phone: '(61) 95555-4404',
  },
]

function addDays(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

function customNotes() {
  return [
    '[Pacote sob medida]',
    'Tipo de evento: Corporativo',
    'Duração desejada: Dois dias',
    'Faixa de investimento: Até R$ 18.000',
    'Necessidades principais: palco, som, recepção, coffee break e montagem antecipada',
    '',
    'Cliente quer proposta formal até sexta-feira.',
  ].join('\n')
}

async function main() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Set ALLOW_DEMO_SEED=true to explicitly seed demonstration data in production')
  }

  const property = await prisma.property.findFirst({
    where: { isActive: true },
    include: {
      packages: { orderBy: { sortOrder: 'asc' } },
      extras: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!property || property.packages.length === 0) {
    throw new Error('Run npm run db:seed before seeding demo data')
  }

  const existingDemoBookings = await prisma.booking.findMany({
    where: {
      user: {
        email: {
          contains: '.demo',
        },
      },
    },
    select: { id: true },
  })

  await prisma.booking.deleteMany({
    where: {
      id: {
        in: existingDemoBookings.map((booking) => booking.id),
      },
    },
  })
  await prisma.contactMessage.deleteMany({
    where: {
      email: {
        contains: '.demo',
      },
    },
  })
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '.demo',
      },
    },
  })

  const users = await Promise.all(
    demoUsers.map((user) =>
      prisma.user.create({
        data: user,
      })
    )
  )

  const packages = property.packages
  const celebration = packages.find((pkg) => pkg.slug === 'celebracao') ?? packages[0]
  const production = packages.find((pkg) => pkg.slug === 'producao') ?? packages[packages.length - 1]
  const essential = packages.find((pkg) => pkg.slug === 'essencial') ?? packages[0]
  const addons = property.extras

  const bookings = [
    {
      user: users[0],
      pkg: celebration,
      status: 'PENDING',
      days: 12,
      guests: 96,
      total: celebration.basePrice + property.operationalFee,
      notes: 'Aniversário de 40 anos, preferência por contato no período da manhã.',
      addonQuantities: [1, 0, 1, 1],
      createdAt: addDays(-1),
    },
    {
      user: users[1],
      pkg: production,
      status: 'CONFIRMED',
      days: 20,
      guests: 140,
      total: 2960,
      notes: 'Casamento intimista com cerimônia no jardim e recepção no salão.',
      addonQuantities: [2, 1, 1, 1],
      createdAt: addDays(-5),
    },
    {
      user: users[2],
      pkg: essential,
      status: 'COMPLETED',
      days: -4,
      guests: 48,
      total: essential.basePrice + property.operationalFee,
      notes: 'Confraternização familiar já realizada.',
      addonQuantities: [0, 0, 1, 0],
      createdAt: addDays(-18),
    },
    {
      user: users[3],
      pkg: production,
      status: 'PENDING',
      days: 34,
      guests: 160,
      total: 4320,
      notes: customNotes(),
      addonQuantities: [3, 1, 1, 1],
      createdAt: addDays(-2),
      customQuote: true,
    },
  ]

  for (const bookingData of bookings) {
    const extraGuests = Math.max(bookingData.guests - bookingData.pkg.includedGuests, 0)
    const booking = await prisma.booking.create({
      data: {
        userId: bookingData.user.id,
        propertyId: property.id,
        packageId: bookingData.pkg.id,
        packageNameSnapshot: bookingData.pkg.name,
        basePriceSnapshot: bookingData.pkg.basePrice,
        extraGuestFeeSnapshot: bookingData.pkg.extraGuestFee,
        operationalFeeSnapshot: property.operationalFee,
        startDate: addDays(bookingData.days),
        endDate: addDays(bookingData.days),
        guests: bookingData.guests,
        extraGuests,
        totalPrice: bookingData.total,
        status: bookingData.status,
        notes: bookingData.notes,
        createdAt: bookingData.createdAt,
        bookingExtras: {
          create: addons
            .map((addon, index) => ({
              extraId: addon.id,
              quantity: bookingData.addonQuantities[index] ?? 0,
            }))
            .filter((addon) => addon.quantity > 0),
        },
      },
    })

    if (bookingData.customQuote) {
      await prisma.customQuote.create({
        data: {
          bookingId: booking.id,
          eventType: 'Corporativo',
          desiredDuration: 'Dois dias',
          budgetRange: 'Até R$ 18.000',
          requirements: 'palco, som, recepção, coffee break e montagem antecipada',
          estimatedAmount: 4320,
          finalAmount: 4800,
          status: 'SENT',
          items: {
            create: [
              { label: 'Pacote Produção', quantity: 1, unit: 'pacote', unitPrice: 1800, total: 1800, source: 'base_package' },
              { label: 'Taxa operacional', quantity: 1, unit: 'taxa', unitPrice: 150, total: 150, source: 'operational_fee' },
              { label: 'Convidados extras', quantity: 10, unit: 'pessoa', unitPrice: 15, total: 150, source: 'extra_guests' },
              { label: 'Adicionais e operação', quantity: 1, unit: 'proposta', unitPrice: 2220, total: 2220, source: 'addon' },
            ],
          },
        },
      })
    }
  }

  await prisma.blockedDate.deleteMany({
    where: {
      propertyId: property.id,
      reason: 'Manutenção preventiva',
    },
  })

  await prisma.blockedDate.create({
    data: {
      propertyId: property.id,
      startDate: addDays(8),
      endDate: addDays(8),
      reason: 'Manutenção preventiva',
    },
  })

  await prisma.contactMessage.createMany({
    data: [
      {
        propertyId: property.id,
        name: 'Camila Nogueira',
        email: 'camila.nogueira@venue.demo',
        phone: '(61) 94444-5505',
        subject: 'Orçamento para formatura',
        message: 'Gostaria de verificar disponibilidade para uma formatura com aproximadamente 120 convidados.',
        status: 'NEW',
      },
      {
        propertyId: property.id,
        name: 'Pedro Almeida',
        email: 'pedro.almeida@venue.demo',
        phone: '(61) 93333-6606',
        subject: 'Evento empresarial',
        message: 'Preciso de uma proposta para um encontro corporativo com recepção, som e apoio operacional.',
        status: 'READ',
      },
    ],
  })

  console.log('Demo data seeded successfully')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
