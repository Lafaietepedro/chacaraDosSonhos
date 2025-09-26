'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Users, MapPin, Star, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '800', '900'] })

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop')"
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${playfair.className} text-6xl md:text-8xl font-extrabold text-gray-900 mb-6 tracking-tight`}>
            Espaço Vip <span className="text-primary">JR</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            O local perfeito para seus momentos especiais. Aniversários, casamentos, 
            confraternizações e muito mais em um ambiente único e acolhedor.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-600">Até 150 pessoas</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-600">Localização privilegiada</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-600">Ambiente completo</span>
            </div>
            <div className="flex flex-col items-center">
              <Calendar className="w-8 h-8 text-primary mb-2" />
              <span className="text-sm font-medium text-gray-600">Reserva online</span>
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
              <a href="https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Espaço%20Vip%20JR." target="_blank" rel="noopener noreferrer">
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
