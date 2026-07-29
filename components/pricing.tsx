'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check, Clock, SlidersHorizontal, Users } from 'lucide-react'
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

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-400/15 text-emerald-200">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Pacote sob medida</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Para casamentos, eventos corporativos, montagem prolongada ou necessidades fora dos planos padrão. A proposta pode combinar duração, áreas, apoio operacional e adicionais.
                </p>
              </div>
            </div>
            <Button className="bg-white text-slate-950 hover:bg-slate-100" asChild>
              <Link href="/booking?mode=custom">
                Montar proposta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-slate-500">
          Valores sujeitos à confirmação do anfitrião. Depois da análise, a equipe formaliza a proposta e orienta os próximos passos da contratação.
        </p>
      </div>
    </section>
  )
}
