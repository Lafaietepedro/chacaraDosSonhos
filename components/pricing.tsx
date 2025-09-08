import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export function Pricing() {
  const packages = [
    {
      name: 'Básico',
      price: 800,
      duration: '8 horas',
      description: 'Perfeito para eventos menores e mais íntimos',
      features: [
        'Acesso à chácara por 8 horas',
        'Até 50 pessoas',
        'Churrasqueira e geladeira',
        'Estacionamento para 15 veículos',
        'Wi-Fi gratuito',
        'Área verde para atividades'
      ],
      notIncluded: [
        'Limpeza pós-evento',
        'Decoração',
        'Sistema de som profissional'
      ],
      popular: false
    },
    {
      name: 'Completo',
      price: 1200,
      duration: '12 horas',
      description: 'O mais escolhido para eventos especiais',
      features: [
        'Acesso à chácara por 12 horas',
        'Até 100 pessoas',
        'Churrasqueira e geladeira',
        'Estacionamento para 25 veículos',
        'Wi-Fi gratuito',
        'Sistema de som básico',
        'Limpeza pós-evento incluída',
        'Área verde para atividades'
      ],
      notIncluded: [
        'Decoração personalizada',
        'Sistema de som profissional'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: 1800,
      duration: '24 horas',
      description: 'Para eventos grandiosos e inesquecíveis',
      features: [
        'Acesso à chácara por 24 horas',
        'Até 150 pessoas',
        'Churrasqueira e geladeira',
        'Estacionamento para 30 veículos',
        'Wi-Fi gratuito',
        'Sistema de som profissional',
        'Limpeza pós-evento incluída',
        'Decoração básica incluída',
        'Área verde para atividades',
        'Suporte durante o evento'
      ],
      notIncluded: [
        'Decoração personalizada premium'
      ],
      popular: false
    }
  ]

  const extras = [
    { name: 'Limpeza pós-evento', price: 150 },
    { name: 'Decoração básica', price: 200 },
    { name: 'Sistema de som profissional', price: 300 },
    { name: 'Piscina (temporada)', price: 100 },
    { name: 'Segurança adicional', price: 250 },
    { name: 'Cozinheiro/Churrasqueiro', price: 400 }
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Nossos Pacotes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o pacote ideal para seu evento. Todos incluem o essencial, 
            com opções de personalização.
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

        {/* Extras */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Extras Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extras.map((extra, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{extra.name}</h4>
                  </div>
                  <div className="text-primary font-semibold">
                    {formatCurrency(extra.price)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
