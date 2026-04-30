'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
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
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Pacotes configuráveis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uma vitrine objetiva para o cliente comparar duração, capacidade e valor antes de solicitar a reserva.
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <Card 
              key={index} 
              className={`relative ${pkg.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <div className="text-4xl font-bold text-primary">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-gray-600">{pkg.duration}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Até {pkg.capacity} pessoas • {formatCurrency(pkg.extraPerGuest)} por convidado extra
                </div>
                <p className="text-sm text-gray-500 mt-2">{pkg.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {pkg.notIncluded.map((feature, idx) => (
                    <li key={idx} className="flex items-start opacity-50">
                      <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={pkg.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/booking">
                    Escolher Pacote
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cleaning fee note */}
        <div className="max-w-3xl mx-auto text-center mt-4">
          <p className="text-sm text-gray-600">
            Taxa operacional configurável: <span className="font-medium">{formatCurrency(operationalFee)}</span> aplicada em todos os pacotes.
          </p>
        </div>

        {/* Note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            * Preços podem variar conforme a temporada e disponibilidade.<br />
            ** Consulte condições especiais para eventos corporativos.
          </p>
        </div>
      </div>
    </section>
  )
}
