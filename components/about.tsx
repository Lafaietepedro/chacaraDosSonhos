import { Card, CardContent } from '@/components/ui/card'
import { TreePine, Home, Car, Wifi, Utensils, Music } from 'lucide-react'

export function About() {
  const features = [
    {
      icon: Home,
      title: 'Casa Principal',
      description: 'Casa confortável com 4 quartos, 3 banheiros, sala ampla e cozinha completa.'
    },
    {
      icon: TreePine,
      title: 'Área Verde',
      description: 'Mais de 5.000m² de área verde com jardins, pomar e espaço para atividades ao ar livre.'
    },
    {
      icon: Car,
      title: 'Estacionamento',
      description: 'Estacionamento para até 30 veículos com fácil acesso e segurança.'
    },
    {
      icon: Utensils,
      title: 'Churrasqueira',
      description: 'Churrasqueira completa com bancadas, geladeira e área de preparo.'
    },
    {
      icon: Music,
      title: 'Som Ambiente',
      description: 'Som ambiente para trilha sonora leve durante o evento.'
    },
    {
      icon: Wifi,
      title: 'Wi-Fi Gratuito',
      description: 'Internet de alta velocidade disponível em toda a propriedade.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Sobre a Chácara dos Sonhos
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Localizada em um ambiente tranquilo e privilegiado, nossa chácara oferece 
            toda a infraestrutura necessária para tornar seu evento inesquecível. 
            Com mais de 5.000m² de área verde e instalações modernas, garantimos 
            conforto e praticidade para você e seus convidados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">150+</div>
            <div className="text-gray-600">Capacidade</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">5000m²</div>
            <div className="text-gray-600">Área Total</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">30</div>
            <div className="text-gray-600">Vagas</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24h</div>
            <div className="text-gray-600">Disponível</div>
          </div>
        </div>
      </div>
    </section>
  )
}
