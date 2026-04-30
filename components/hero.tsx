'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Users, MapPin, Star, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'

export function Hero() {
  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero entender como funciona o ${siteConfig.appName}.`)

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-slate-950">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35"
        style={{
          backgroundImage: `url('${siteConfig.heroImage}')`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950/80" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-4 text-sm font-semibold uppercase text-emerald-200">
            Gestão de reservas para espaços de eventos
          </p>
          <h1 className="font-serif text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tight">
            {siteConfig.appName}
          </h1>
          <p className="text-xl md:text-2xl text-slate-100 mb-8 max-w-2xl mx-auto">
            {siteConfig.shortPitch}
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-slate-100">Até {siteConfig.capacity} pessoas</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-slate-100">Dados configuráveis</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-slate-100">Orçamento guiado</span>
            </div>
            <div className="flex flex-col items-center">
              <Calendar className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-slate-100">Agenda centralizada</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg" asChild>
              <Link href="/booking">
                <Calendar className="w-6 h-6 mr-2" />
                Fazer Reserva
              </Link>
            </Button>
            <Button variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-6 h-6 mr-2" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg" asChild>
              <Link href="#gallery">
                Ver Galeria
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}
