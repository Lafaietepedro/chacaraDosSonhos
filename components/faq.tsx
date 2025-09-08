'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: 'Qual é a capacidade máxima da chácara?',
      answer: 'Nossa chácara tem capacidade para até 150 pessoas confortavelmente. Para eventos maiores, podemos discutir opções especiais.'
    },
    {
      question: 'Qual é o horário de funcionamento?',
      answer: 'A chácara está disponível 24 horas por dia, 7 dias por semana. Os pacotes incluem diferentes durações (8h, 12h ou 24h).'
    },
    {
      question: 'É permitido levar animais de estimação?',
      answer: 'Sim, animais de estimação são bem-vindos! Pedimos apenas que sejam mantidos sob supervisão e que os dejetos sejam recolhidos.'
    },
    {
      question: 'Há estacionamento disponível?',
      answer: 'Sim, temos estacionamento para até 30 veículos, com fácil acesso e segurança durante todo o evento.'
    },
    {
      question: 'O que está incluído no preço?',
      answer: 'Cada pacote inclui diferentes itens. Consulte nossa seção de preços para detalhes completos. Básico inclui acesso e infraestrutura, Completo inclui limpeza, e Premium inclui decoração básica e som profissional.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos PIX, cartão de crédito/débito e transferência bancária. Para reservas, é necessário pagar 50% como sinal e o restante até 7 dias antes do evento.'
    },
    {
      question: 'Posso cancelar minha reserva?',
      answer: 'Sim, mas há políticas de cancelamento. Até 30 dias antes: reembolso total. Entre 15-30 dias: 50% de reembolso. Menos de 15 dias: sem reembolso.'
    },
    {
      question: 'Há Wi-Fi disponível?',
      answer: 'Sim, oferecemos Wi-Fi gratuito de alta velocidade em toda a propriedade para você e seus convidados.'
    },
    {
      question: 'É possível fazer o evento em dias de chuva?',
      answer: 'Sim! Temos áreas cobertas e a casa principal para abrigar todos os convidados em caso de chuva.'
    },
    {
      question: 'Há algum horário de silêncio?',
      answer: 'Sim, respeitamos os vizinhos. O horário de silêncio é das 22h às 8h, mas a música pode continuar em volume baixo.'
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre nossa chácara e serviços
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <CardContent className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Não encontrou a resposta que procurava?
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Entre em contato conosco
          </a>
        </div>
      </div>
    </section>
  )
}
