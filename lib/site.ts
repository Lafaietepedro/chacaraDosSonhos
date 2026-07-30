import demoCatalog from '../config/villa-aurora.json'

const property = demoCatalog.property

export const siteConfig = {
  appName: property.name,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  demoLabel: 'Demonstração funcional — LPeM Software · dados e imagens ilustrativos',
  appDescription: property.description,
  venueName: property.name,
  shortPitch:
    'Reservas online para espaços de eventos com vitrine pública, cálculo de orçamento, agenda e painel do anfitrião.',
  longPitch:
    'Uma base profissional para operadores de salões, espaços ao ar livre e áreas de lazer que precisam reduzir atendimento manual, organizar solicitações e manter uma visão clara de disponibilidade, receita e próximos eventos.',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@lpemsoftware.com.br',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '',
  address: property.address,
  city: property.city,
  capacity: property.capacity,
  area: property.area,
  parkingSpots: property.parkingSpots,
  cleaningFee: property.operationalFee,
  heroImage: '/gallery/venue-exterior.jpg',
  keywords:
    'espaço para eventos Mairiporã, casamento Serra da Cantareira, Villa Aurora, chácara para eventos, reserva de espaço para festas',
}

export const bookingPackages = demoCatalog.packages
export const bookingAddons = demoCatalog.addons

export function buildWhatsAppUrl(message: string) {
  if (!siteConfig.whatsappPhone) return ''
  return `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(message)}`
}
