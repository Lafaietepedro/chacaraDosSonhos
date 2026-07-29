export const siteConfig = {
  appName: 'Venue Eventos',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  demoLabel: 'Demonstração funcional criada pela LPeM Software',
  appDescription:
    'Plataforma operacional para divulgar espaços de eventos, receber reservas qualificadas e acompanhar a agenda do anfitrião.',
  venueName: 'Venue Eventos',
  shortPitch:
    'Reservas online para espaços de eventos com vitrine pública, cálculo de orçamento, agenda e painel do anfitrião.',
  longPitch:
    'Uma base profissional para operadores de salões, espaços ao ar livre e áreas de lazer que precisam reduzir atendimento manual, organizar solicitações e manter uma visão clara de disponibilidade, receita e próximos eventos.',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@lpemsoftware.com.br',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '',
  address: 'Projeto demonstrativo da LPeM Software',
  city: 'Atendimento nacional',
  capacity: 150,
  area: '5.000 m²',
  parkingSpots: 30,
  cleaningFee: 150,
  heroImage: '/gallery/venue-exterior.jpg',
  keywords:
    'reservas para eventos, gestão de espaços, aluguel de espaço para eventos, agenda de reservas, painel do anfitrião',
}

export const bookingPackages = [
  {
    id: 'essencial',
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
    id: 'celebracao',
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
    id: 'producao',
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
