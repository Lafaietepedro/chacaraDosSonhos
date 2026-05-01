'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { siteConfig } from '@/lib/site'
import { fallbackPackageOptions } from '@/lib/catalog'
import type { CatalogResponse, PackageOption } from '@/types/booking'

export function Pricing() {
  const [packages, setPackages] = useState<PackageOption[]>(fallbackPackageOptions)
  const [operationalFee, setOperationalFee] = useState(siteConfig.cleaningFee)

  useEffect(() => {
    fetch('/api/catalog')
      .then(async (res) => {
        if (!res.ok) return
        const data = (await res.json()) as CatalogResponse
        if (data.packages.length > 0) {
          setPackages(data.packages)
          setOperationalFee(data.property.operationalFee)
        }
      })
      .catch((error) => {
        console.warn('Não foi possível carregar pacotes do banco:', error)
      })
  }, [])

  return (
    <section id="pricing" className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Pacotes</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Comparação clara para o cliente escolher sem atrito.
            </h2>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-600">
              Taxa operacional atual: <span className="font-semibold text-slate-950">{formatCurrency(operationalFee)}</span>. Valores e capacidades são editáveis no dashboard, preservando snapshots nas reservas antigas.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden shadow-sm ${
                pkg.popular ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'
              }`}
            >
              {pkg.popular && (
                <div className="bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
                  Melhor equilíbrio
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-950">{pkg.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{pkg.description}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-4xl font-black text-slate-950">{formatCurrency(pkg.price)}</div>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatCurrency(pkg.extraPerGuest)} por convidado extra
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-slate-50 p-3">
                    <Clock className="mb-2 h-4 w-4 text-emerald-700" />
                    <p className="text-sm font-medium text-slate-950">{pkg.duration}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <Users className="mb-2 h-4 w-4 text-emerald-700" />
                    <p className="text-sm font-medium text-slate-950">Até {pkg.capacity} pessoas</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {pkg.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="mt-7 w-full" variant={pkg.popular ? 'default' : 'outline'} asChild>
                  <Link href="/booking">
                    Escolher pacote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-slate-500">
          Preços sujeitos à confirmação do anfitrião. A estrutura está pronta para evoluir para pagamento de sinal e contrato PDF.
        </p>
      </div>
    </section>
  )
}
