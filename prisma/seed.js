const { randomBytes, scryptSync } = require('crypto')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const siteConfig = {
  venueName: 'Venue Eventos',
  appDescription:
    'Plataforma operacional para divulgar espaços de eventos, receber reservas qualificadas e acompanhar a agenda do anfitrião.',
  email: 'contato@venueeventos.com.br',
  phone: '(61) 99999-9999',
  address: 'Endereço comercial configurável',
  city: 'Brasília - DF',
  capacity: 150,
  cleaningFee: 150,
}

const packages = [
  {
    slug: 'essencial',
    name: 'Essencial',
    price: 800,
    duration: '8 horas',
    capacity: 50,
    extraPerGuest: 20,
    description: 'Para encontros menores com infraestrutura organizada',
    features: [
      'Uso do espaço por 8 horas',
      'Até 50 pessoas',
      'Área gourmet equipada',
      'Estacionamento para 15 veículos',
      'Wi-Fi para convidados',
      'Área externa para convivência',
      'Piscina inclusa',
    ],
    notIncluded: ['Decoração personalizada'],
    popular: false,
  },
  {
    slug: 'celebracao',
    name: 'Celebração',
    price: 1200,
    duration: '12 horas',
    capacity: 100,
    extraPerGuest: 18,
    description: 'O plano mais equilibrado para festas e confraternizações',
    features: [
      'Uso do espaço por 12 horas',
      'Até 100 pessoas',
      'Área gourmet equipada',
      'Estacionamento para 25 veículos',
      'Wi-Fi para convidados',
      'Sistema de som básico',
      'Área externa para convivência',
      'Piscina inclusa',
    ],
    notIncluded: ['Decoração premium'],
    popular: true,
  },
  {
    slug: 'producao',
    name: 'Produção',
    price: 1800,
    duration: '24 horas',
    capacity: 150,
    extraPerGuest: 15,
    description: 'Para eventos maiores com montagem, permanência e suporte',
    features: [
      'Uso do espaço por 24 horas',
      'Até 150 pessoas',
      'Área gourmet equipada',
      'Estacionamento para 30 veículos',
      'Wi-Fi para convidados',
      'Som ambiente',
      'Decoração base incluída',
      'Área externa para convivência',
      'Piscina inclusa',
      'Apoio operacional no dia',
    ],
    notIncluded: ['Produção cenográfica sob medida'],
    popular: false,
  },
]

const legacyPropertyNames = new Set([
  'Espaço Vip JR',
  'Chácara dos Sonhos',
  'Chacara dos Sonhos',
  'ReservaNexa',
])

function stringifyList(items) {
  return JSON.stringify(items)
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('base64url')
  const hash = scryptSync(password, salt, 64).toString('base64url')

  return `scrypt:${salt}:${hash}`
}

function getAdminCredentials() {
  const username = process.env.DASHBOARD_USERNAME || (process.env.NODE_ENV === 'production' ? undefined : 'admin')
  const password = process.env.DASHBOARD_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'admin123')

  if (!username || !password) {
    throw new Error('DASHBOARD_USERNAME e DASHBOARD_PASSWORD precisam estar configurados para criar o primeiro admin.')
  }

  return { username, password }
}

async function seedPropertyAndPackages() {
  let property = await prisma.property.findFirst({
    where: { isActive: true },
  })

  if (!property) {
    property = await prisma.property.create({
      data: {
        name: siteConfig.venueName,
        description: siteConfig.appDescription,
        capacity: siteConfig.capacity,
        basePrice: packages[0].price,
        operationalFee: siteConfig.cleaningFee,
        contactEmail: siteConfig.email,
        contactPhone: siteConfig.phone,
        address: `${siteConfig.address} - ${siteConfig.city}`,
      },
    })

    console.log(`Property criada: ${property.name}`)
  } else {
    let renamedLegacyProperty = false

    if (legacyPropertyNames.has(property.name)) {
      property = await prisma.property.update({
        where: { id: property.id },
        data: {
          name: siteConfig.venueName,
          description: siteConfig.appDescription,
          contactEmail: siteConfig.email,
          contactPhone: siteConfig.phone,
        },
      })

      console.log(`Property legada renomeada para: ${property.name}`)
      renamedLegacyProperty = true
    }

    if (!renamedLegacyProperty) {
      console.log(`Property existente mantida: ${property.name}`)
    }
  }

  for (const [index, pkg] of packages.entries()) {
    await prisma.bookingPackage.upsert({
      where: {
        propertyId_slug: {
          propertyId: property.id,
          slug: pkg.slug,
        },
      },
      update: {},
      create: {
        propertyId: property.id,
        slug: pkg.slug,
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.price,
        duration: pkg.duration,
        includedGuests: pkg.capacity,
        extraGuestFee: pkg.extraPerGuest,
        features: stringifyList(pkg.features),
        notIncluded: stringifyList(pkg.notIncluded),
        isPopular: pkg.popular,
        sortOrder: index,
      },
    })
  }

  console.log(`Pacotes verificados: ${packages.length}`)
}

async function seedAdmin() {
  const adminCount = await prisma.adminUser.count()
  if (adminCount > 0) {
    console.log('Admin existente mantido.')
    return
  }

  const { username, password } = getAdminCredentials()

  await prisma.adminUser.create({
    data: {
      email: username,
      name: 'Administrador',
      passwordHash: hashPassword(password),
    },
  })

  console.log(`Admin criado: ${username}`)
}

async function main() {
  await seedPropertyAndPackages()
  await seedAdmin()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
