'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'A plataforma impede reserva em data ocupada?',
    answer: 'Sim. O backend verifica reservas pendentes ou confirmadas e datas bloqueadas antes de criar uma nova solicitação.',
  },
  {
    question: 'Os valores mudam reservas antigas?',
    answer: 'Não. A reserva grava snapshots de pacote, preço base, taxa operacional e convidado extra no momento da criação.',
  },
  {
    question: 'O painel permite encerrar o ciclo da reserva?',
    answer: 'Sim. O anfitrião pode aprovar, recusar, cancelar e concluir reservas com transições validadas no backend.',
  },
  {
    question: 'Existe pagamento online implementado?',
    answer: 'Ainda não. A estrutura está pronta para evoluir para sinal, PIX, cartão e confirmação por webhook.',
  },
  {
    question: 'Funciona para mais de um espaço?',
    answer: 'O schema suporta propriedades, mas a interface atual opera como instalação de um espaço principal. Multiunidade deve entrar como fase posterior.',
  },
  {
    question: 'O projeto está pronto para vender como SaaS?',
    answer: 'Ainda não. Para SaaS faltam onboarding, permissões, auditoria, cobrança, isolamento de dados e suporte operacional.',
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
            <p className="text-sm font-semibold uppercase text-emerald-700">Dúvidas técnicas</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              O que já está pronto e o que ainda é roadmap.
            </h2>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              A leitura honesta do estado atual evita vender o projeto como mais maduro do que ele é, e ajuda a priorizar o que realmente melhora o produto.
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
