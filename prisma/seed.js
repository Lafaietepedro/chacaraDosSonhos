const { randomBytes, scryptSync } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const demoCatalog = require('../config/villa-aurora.json')
const { classifyExistingProperty } = require('./seed-safety')

const prisma = new PrismaClient()

const siteConfig = {
  venueName: demoCatalog.property.name,
  appDescription: demoCatalog.property.description,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@lpemsoftware.com.br',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || null,
  address: demoCatalog.property.address,
  city: demoCatalog.property.city,
  capacity: demoCatalog.property.capacity,
  cleaningFee: demoCatalog.property.operationalFee,
}

const packages = demoCatalog.packages.map((pkg) => ({ ...pkg, slug: pkg.id }))
const addons = demoCatalog.addons


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
        address: siteConfig.address,
      },
    })

    console.log(`Property criada: ${property.name}`)
  } else {
    if (classifyExistingProperty(property.name) === 'reject') {
      throw new Error(
        `Seed abortado: a propriedade ativa "${property.name}" não pertence à demonstração Villa Aurora.`
      )
    }

    property = await prisma.property.update({
      where: { id: property.id },
      data: {
        name: siteConfig.venueName,
        description: siteConfig.appDescription,
        capacity: siteConfig.capacity,
        basePrice: packages[0].price,
        operationalFee: siteConfig.cleaningFee,
        contactEmail: siteConfig.email,
        contactPhone: siteConfig.phone,
        address: siteConfig.address,
      },
    })

    console.log(`Property demonstrativa sincronizada: ${property.name}`)
  }

  for (const [index, pkg] of packages.entries()) {
    await prisma.bookingPackage.upsert({
      where: {
        propertyId_slug: {
          propertyId: property.id,
          slug: pkg.slug,
        },
      },
      update: {
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.price,
        duration: pkg.duration,
        includedGuests: pkg.capacity,
        extraGuestFee: pkg.extraPerGuest,
        features: stringifyList(pkg.features),
        notIncluded: stringifyList(pkg.notIncluded),
        isPopular: pkg.popular,
        isActive: true,
        sortOrder: index,
      },
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

  await prisma.bookingPackage.updateMany({
    where: {
      propertyId: property.id,
      slug: { notIn: packages.map((pkg) => pkg.slug) },
      isActive: true,
    },
    data: { isActive: false },
  })

  console.log(`Pacotes verificados: ${packages.length}`)

  for (const addon of addons) {
    const existing = await prisma.extra.findFirst({
      where: {
        propertyId: property.id,
        name: addon.name,
      },
    })

    if (existing) {
      await prisma.extra.update({
        where: { id: existing.id },
        data: {
          description: addon.description,
          price: addon.price,
          isActive: true,
        },
      })
    } else {
      await prisma.extra.create({
        data: {
          propertyId: property.id,
          name: addon.name,
          description: addon.description,
          price: addon.price,
        },
      })
    }
  }

  await prisma.extra.updateMany({
    where: {
      propertyId: property.id,
      name: { notIn: addons.map((addon) => addon.name) },
      isActive: true,
    },
    data: { isActive: false },
  })

  console.log(`Adicionais verificados: ${addons.length}`)
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
