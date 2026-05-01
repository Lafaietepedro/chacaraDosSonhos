import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, CalendarDays, ClipboardCheck, LayoutDashboard, LockKeyhole, MessageSquare } from 'lucide-react'
import { siteConfig } from '@/lib/site'

const workflow = [
  {
    icon: MessageSquare,
    title: 'Entrada qualificada',
    description: 'Contato e reserva chegam com dados suficientes para reduzir perguntas repetidas.',
  },
  {
    icon: CalendarDays,
    title: 'Disponibilidade real',
    description: 'A API bloqueia datas ocupadas ou indisponíveis antes de criar uma solicitação.',
  },
  {
    icon: ClipboardCheck,
    title: 'Decisão do anfitrião',
    description: 'Pedidos pendentes podem ser aprovados, recusados, cancelados ou concluídos no painel.',
  },
  {
    icon: LayoutDashboard,
    title: 'Rotina administrativa',
    description: 'Reservas, bloqueios, contatos, pacotes e configurações ficam no mesmo ambiente.',
  },
]

const metrics = [
  { value: `${siteConfig.capacity}`, label: 'capacidade configurada' },
  { value: '3', label: 'pacotes iniciais' },
  { value: '24h', label: 'sessão administrativa' },
  { value: '6', label: 'regras testadas' },
]

export function About() {
  return (
    <section id="about" className="bg-slate-950 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-sm font-semibold uppercase text-emerald-300">
              Operação do espaço
            </p>
            <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Da primeira mensagem à agenda confirmada.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              {siteConfig.longPitch}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-md border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-bold text-amber-200">{metric.value}</div>
                  <div className="mt-1 text-sm text-slate-300">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/[0.06] text-white shadow-none">
                <CardContent className="p-6">
                  <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </CardContent>
              </Card>
            ))}

            <div className="rounded-md border border-amber-200/20 bg-amber-100/10 p-6 md:col-span-2">
              <div className="flex items-center gap-3 text-amber-100">
                <LockKeyhole className="h-5 w-5" />
                <h3 className="font-semibold">Base pronta para evoluir</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                A arquitetura já separa preço, disponibilidade, status, validação e notificação em serviços testáveis. Pagamentos, contrato PDF e gestão de fotos podem entrar como módulos posteriores.
              </p>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.04] p-6 md:col-span-2">
              <div className="flex items-center gap-3 text-emerald-200">
                <BarChart3 className="h-5 w-5" />
                <h3 className="font-semibold">Indicadores para decisão</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                O painel acompanha volume de reservas, pendências, receita mensal e ocupação, mantendo a operação legível para quem administra o espaço todos os dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
