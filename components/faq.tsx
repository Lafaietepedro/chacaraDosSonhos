'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: 'A plataforma já impede reserva em data ocupada?',
      answer: 'Sim. O backend verifica reservas pendentes/confirmadas e datas bloqueadas antes de criar uma nova solicitação.'
    },
    {
      question: 'Os pacotes podem ser alterados?',
      answer: 'Sim. Os pacotes, valores, duração e capacidade foram centralizados em configuração para facilitar adaptação a diferentes espaços.'
    },
    {
      question: 'Existe pagamento online implementado?',
      answer: 'Ainda não. A base possui dependências de Stripe, mas o fluxo atual registra a solicitação e deixa pagamento como item de roadmap.'
    },
    {
      question: 'O painel é protegido?',
      answer: 'Sim. O administrador é persistido no banco com senha hasheada e sessão assinada. Para SaaS, ainda falta controle granular de papéis.'
    },
    {
      question: 'As notificações por WhatsApp são reais?',
      answer: 'Existe um helper para webhook ou CallMeBot. Em produção, a recomendação é integrar WhatsApp Business API ou um provedor transacional.'
    },
    {
      question: 'O formulário de contato envia email?',
      answer: 'No estado atual, o formulário apenas simula envio no navegador. O fluxo principal persistido é a solicitação de reserva.'
    },
    {
      question: 'Funciona para mais de um espaço?',
      answer: 'O schema suporta propriedades, mas a interface atual opera como instalação de um espaço principal. Multiunidade é viável, mas deve ser planejado como próxima fase.'
    },
    {
      question: 'Dá para gerar contrato automaticamente?',
      answer: 'Ainda não há tela de contrato. O schema já tem campos para contractUrl e signature, então a funcionalidade é viável como módulo posterior.'
    },
    {
      question: 'O projeto está pronto para vender como SaaS?',
      answer: 'Ainda não. Ele é uma boa base de produto, mas precisa de autenticação robusta, permissões, pagamentos, auditoria e onboarding antes de virar SaaS.'
    },
    {
      question: 'Qual é a melhor próxima evolução?',
      answer: 'Adicionar filtros operacionais no dashboard, email transacional e um fluxo formal de pagamento de sinal.'
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
            Limites atuais, viabilidade e próximos passos técnicos
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
