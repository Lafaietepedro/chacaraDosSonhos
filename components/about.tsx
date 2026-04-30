import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, CalendarDays, ClipboardCheck, CreditCard, LayoutDashboard, MessageSquare } from 'lucide-react'
import { siteConfig } from '@/lib/site'

export function About() {
  const features = [
    {
      icon: CalendarDays,
      title: 'Agenda Operacional',
      description: 'Visualize solicitações, reservas aprovadas e datas indisponíveis em uma única rotina.'
    },
    {
      icon: ClipboardCheck,
      title: 'Reserva Guiada',
      description: 'O cliente informa data, convidados, pacote e contato antes de chegar ao atendimento humano.'
    },
    {
      icon: LayoutDashboard,
      title: 'Painel do Anfitrião',
      description: 'Acompanhe pendências, aprove ou recuse pedidos e consulte detalhes de cada evento.'
    },
    {
      icon: CreditCard,
      title: 'Base para Pagamentos',
      description: 'Estrutura pronta para evoluir para sinal, recibos, PIX e cartão com confirmação automática.'
    },
    {
      icon: MessageSquare,
      title: 'Contato Rápido',
      description: 'Fluxo pensado para WhatsApp, reduzindo respostas repetidas e perda de contexto.'
    },
    {
      icon: BarChart3,
      title: 'Indicadores',
      description: 'Resumo de reservas, pendências e receita para apoiar decisões de preço e agenda.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Uma base séria para operar reservas
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            {siteConfig.longPitch}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">{siteConfig.capacity}+</div>
            <div className="text-gray-600">Convidados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">3</div>
            <div className="text-gray-600">Pacotes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24h</div>
            <div className="text-gray-600">Sessão admin</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">R$</div>
            <div className="text-gray-600">Cálculo automático</div>
          </div>
        </div>
      </div>
    </section>
  )
}
