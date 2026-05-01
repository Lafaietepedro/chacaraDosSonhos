'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, CheckCircle2, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'

const proofPoints = [
  'Reserva qualificada antes do atendimento',
  'Agenda protegida contra conflitos',
  'Pacotes e taxas editáveis pelo painel',
]

export function Hero() {
  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero entender como funciona o ${siteConfig.appName}.`)

  return (
    <section id="home" className="relative min-h-[92vh] overflow-hidden bg-slate-950 pt-20 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${siteConfig.heroImage}')` }}
      />
      <div className="absolute inset-0 bg-slate-950/[0.72]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(92vh-5rem)] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full min-w-0 gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="min-w-0 max-w-4xl">
            <div className="mb-7 flex w-full max-w-full items-start gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium leading-6 text-emerald-100 backdrop-blur sm:w-fit">
              <Sparkles className="mt-1 h-4 w-4 shrink-0 text-amber-200" />
              <span className="min-w-0 break-words">Plataforma para operar espaços de eventos com menos improviso</span>
            </div>

            <h1 className="max-w-5xl break-words font-serif text-4xl font-black leading-[0.95] tracking-normal sm:text-5xl md:text-7xl lg:text-8xl">
              Venue Eventos
            </h1>
            <p className="mt-7 max-w-3xl break-words text-lg leading-8 text-slate-100 md:text-2xl md:leading-9">
              {siteConfig.shortPitch}
            </p>

            <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button className="h-12 w-full px-6 text-base sm:w-auto" asChild>
                <Link href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Solicitar reserva
                </Link>
              </Button>
              <Button variant="outline" className="h-12 w-full border-white/70 bg-white px-6 text-base text-slate-950 hover:bg-slate-100 sm:w-auto" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </a>
              </Button>
              <Button variant="ghost" className="h-12 w-full px-6 text-base text-white hover:bg-white/10 hover:text-white sm:w-auto" asChild>
                <Link href="#pricing">
                  Ver pacotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid w-full min-w-0 max-w-[calc(100vw-2rem)] gap-3 overflow-hidden rounded-md border border-white/15 bg-slate-950/[0.62] p-4 backdrop-blur md:grid-cols-3 lg:max-w-full lg:grid-cols-1">
            {proofPoints.map((point) => (
              <div key={point} className="flex min-w-0 items-start gap-3 rounded-md border border-white/10 bg-white/[0.08] p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span className="min-w-0 break-words text-sm leading-6 text-slate-100">{point}</span>
              </div>
            ))}
            <div className="rounded-md border border-amber-200/30 bg-amber-100/10 p-4">
              <div className="flex items-center gap-2 text-amber-100">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">Operação centralizada</span>
              </div>
              <p className="mt-2 break-words text-sm leading-6 text-slate-200">
                Reservas, bloqueios, contatos e pacotes vivem no mesmo fluxo administrativo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
