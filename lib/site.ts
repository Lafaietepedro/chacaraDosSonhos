export const siteConfig = {
  appName: 'Villa Aurora',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  demoLabel: 'Demonstração funcional — LPeM Software · dados e imagens ilustrativos',
  appDescription:
    'Um espaço de eventos exclusivo na Serra da Cantareira, preparado para celebrações de até 250 convidados.',
  venueName: 'Villa Aurora',
  shortPitch:
    'Reservas online para espaços de eventos com vitrine pública, cálculo de orçamento, agenda e painel do anfitrião.',
  longPitch:
    'Uma base profissional para operadores de salões, espaços ao ar livre e áreas de lazer que precisam reduzir atendimento manual, organizar solicitações e manter uma visão clara de disponibilidade, receita e próximos eventos.',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@lpemsoftware.com.br',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '',
  address: 'Serra da Cantareira · Mairiporã, SP',
  city: 'Mairiporã, SP',
  capacity: 250,
  area: '5.000 m²',
  parkingSpots: 30,
  cleaningFee: 150,
  heroImage: '/gallery/venue-exterior.jpg',
  keywords:
    'espaço para eventos Mairiporã, casamento Serra da Cantareira, Villa Aurora, chácara para eventos, reserva de espaço para festas',
}

export const bookingPackages = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 4500,
    duration: '6 horas',
    capacity: 80,
    extraPerGuest: 65,
    description: 'Para celebrações intimistas com toda a estrutura necessária.',
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
    id: 'celebracao',
    name: 'Celebração',
    price: 7900,
    duration: '10 horas',
    capacity: 150,
    extraPerGuest: 55,
    description: 'Tempo e liberdade na medida certa para viver o dia por inteiro.',
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
    id: 'assinatura-aurora',
    name: 'Assinatura Aurora',
    price: 12500,
    duration: '14 horas',
    capacity: 250,
    extraPerGuest: 48,
    description: 'A experiência completa, da preparação ao último convidado.',
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
] as const

export const bookingAddons = [
  {
    name: 'Hora extra',
    description: 'Extensão de uso do espaço para eventos que precisam passar do horário contratado.',
    price: 180,
  },
  {
    name: 'Apoio operacional',
    description: 'Profissional de apoio para recepção, organização de acesso e acompanhamento do evento.',
    price: 320,
  },
  {
    name: 'Limpeza reforçada',
    description: 'Equipe adicional para eventos maiores, montagem prolongada ou uso intenso de áreas comuns.',
    price: 260,
  },
  {
    name: 'Som e iluminação base',
    description: 'Estrutura básica para cerimônias, confraternizações e apresentações de pequeno porte.',
    price: 450,
  },
] as const

export function buildWhatsAppUrl(message: string) {
  if (!siteConfig.whatsappPhone) return ''
  return `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(message)}`
}
