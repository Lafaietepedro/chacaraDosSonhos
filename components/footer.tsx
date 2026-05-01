import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { BrandLogo } from '@/components/brand-logo'

const quickLinks = [
  { name: 'Operação', href: '#about' },
  { name: 'Galeria', href: '#gallery' },
  { name: 'Pacotes', href: '#pricing' },
  { name: 'Dúvidas', href: '#faq' },
  { name: 'Contato', href: '#contact' },
]

const productItems = [
  'Agenda e bloqueios',
  'Reservas com snapshots',
  'Pacotes editáveis',
  'Contato persistido',
  'Dashboard administrativo',
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <BrandLogo variant="light" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              {siteConfig.appDescription}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Navegação</h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Produto</h3>
            <ul className="mt-4 space-y-2">
              {productItems.map((item) => (
                <li key={item} className="text-sm text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Contato</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  {siteConfig.address}
                  <br />
                  {siteConfig.city}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>{siteConfig.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>{siteConfig.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} {siteConfig.appName}. Projeto de portfólio técnico.</p>
          <Link href="/dashboard" className="transition-colors hover:text-white">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  )
}
