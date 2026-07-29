'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'Como verifico se a data está disponível?',
    answer: 'Informe a data desejada no fluxo de reserva. O sistema consulta a agenda e avisa imediatamente quando já existe uma solicitação ativa ou um bloqueio operacional.',
  },
  {
    question: 'Como o orçamento é calculado?',
    answer: 'O valor considera o pacote escolhido, a quantidade de convidados, a taxa operacional e os adicionais selecionados. Você confere o resumo antes de enviar a solicitação.',
  },
  {
    question: 'A reserva é confirmada imediatamente?',
    answer: 'A solicitação entra como pendente para análise do anfitrião. Depois da conferência dos detalhes, você recebe o retorno com a confirmação e os próximos passos.',
  },
  {
    question: 'Posso solicitar um pacote personalizado?',
    answer: 'Sim. O modo sob medida permite informar tipo de evento, duração, faixa de investimento e necessidades especiais para receber uma proposta adequada.',
  },
  {
    question: 'O que acontece depois do envio?',
    answer: 'A equipe recebe os dados no painel, analisa agenda e estrutura, ajusta o orçamento quando necessário e acompanha a solicitação até a conclusão.',
  },
  {
    question: 'Meus dados ficam organizados com segurança?',
    answer: 'As solicitações são validadas antes do registro e o painel administrativo exige uma sessão protegida. Os dados são usados apenas para o atendimento e a gestão da reserva.',
  },
]

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }

  return (
    <section id="faq" className="bg-stone-50 py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Dúvidas frequentes</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Tudo o que você precisa saber antes de solicitar uma data.
            </h2>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              O fluxo foi desenhado para deixar valores, disponibilidade e próximos passos claros desde o primeiro contato.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={faq.question} className="overflow-hidden border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <h3 className="text-base font-semibold text-slate-950">{faq.question}</h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <CardContent className="px-5 pb-5 pt-0">
                    <p className="text-sm leading-6 text-slate-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
