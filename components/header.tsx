'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Menu, MessageCircle, Settings, X } from 'lucide-react'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'
import { BrandLogo } from '@/components/brand-logo'

const navigation = [
  { name: 'Operação', href: '#about' },
  { name: 'Galeria', href: '#gallery' },
  { name: 'Pacotes', href: '#pricing' },
  { name: 'Dúvidas', href: '#faq' },
  { name: 'Contato', href: '#contact' },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero saber mais sobre o ${siteConfig.appName}.`)

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/[0.94] backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="sm" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/booking">
                <Calendar className="mr-2 h-4 w-4" />
                Reservar
              </Link>
            </Button>
          </div>

          <button
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="grid gap-2 pt-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/booking">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservar
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
