'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Calendar, Phone, MessageCircle, Settings } from 'lucide-react'
import { buildWhatsAppUrl, siteConfig } from '@/lib/site'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const whatsappUrl = buildWhatsAppUrl(`Olá! Quero saber mais sobre o ${siteConfig.appName}.`)

  const navigation = [
    { name: 'Início', href: '#home' },
    { name: 'Sobre', href: '#about' },
    { name: 'Galeria', href: '#gallery' },
    { name: 'Preços', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contato', href: '#contact' },
  ]

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-black text-white">
              VE
            </div>
            <span className="font-serif text-xl md:text-xl font-extrabold text-gray-900 mb-1 tracking-tight">{siteConfig.appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="#contact">
                <Phone className="w-4 h-4 mr-2" />
                Contato
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/booking">
                <Calendar className="w-4 h-4 mr-2" />
                Reservar
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="#contact">
                    <Phone className="w-4 h-4 mr-2" />
                    Contato
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/booking">
                    <Calendar className="w-4 h-4 mr-2" />
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
