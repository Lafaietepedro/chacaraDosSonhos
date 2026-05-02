'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  Mail,
  Phone,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  WalletCards,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fallbackAddonOptions, fallbackPackageOptions } from '@/lib/catalog'
import { siteConfig } from '@/lib/site'
import { cn, formatCurrency, formatDate, parseLocalDate } from '@/lib/utils'
import type { AddonOption, CatalogResponse, PackageOption } from '@/types/booking'

const stepLabels = ['Agenda', 'Pacote', 'Contato']

type CustomDetails = {
  eventType: string
  desiredDuration: string
  budgetRange: string
  requirements: string
}

function findCustomBasePackage(packages: PackageOption[]) {
  return (
    packages.find((pkg) => pkg.slug === 'producao') ??
    packages.find((pkg) => pkg.popular) ??
    packages[0]
  )
}

function buildCustomNotes(details: CustomDetails) {
  const rows = [
    '[Pacote sob medida]',
    details.eventType && `Tipo de evento: ${details.eventType}`,
    details.desiredDuration && `Duração desejada: ${details.desiredDuration}`,
    details.budgetRange && `Faixa de investimento: ${details.budgetRange}`,
    details.requirements && `Necessidades principais: ${details.requirements}`,
  ].filter(Boolean)

  return rows.join('\n')
}

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [dateError, setDateError] = useState('')
  const [guests, setGuests] = useState(50)
  const [packages, setPackages] = useState<PackageOption[]>(fallbackPackageOptions)
  const [addons, setAddons] = useState<AddonOption[]>(fallbackAddonOptions)
  const [operationalFee, setOperationalFee] = useState(siteConfig.cleaningFee)
  const [selectedPackage, setSelectedPackage] = useState<string>(fallbackPackageOptions[1].id)
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({})
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const [customDetails, setCustomDetails] = useState<CustomDetails>({
    eventType: '',
    desiredDuration: '',
    budgetRange: '',
    requirements: '',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsCustomMode(params.get('mode') === 'custom')
  }, [])

  useEffect(() => {
    fetch('/api/catalog')
      .then(async (res) => {
        if (!res.ok) return
        const data = (await res.json()) as CatalogResponse
        if (data.packages.length > 0) {
          setPackages(data.packages)
          setAddons(data.addons?.length > 0 ? data.addons : fallbackAddonOptions)
          setOperationalFee(data.property.operationalFee)
          setSelectedPackage((current) =>
            data.packages.some((pkg) => pkg.id === current) ? current : data.packages[0].id
          )
        }
      })
      .catch((error) => {
        console.warn('Não foi possível carregar catálogo do banco:', error)
      })
  }, [])

  useEffect(() => {
    if (!isCustomMode || packages.length === 0) return

    const basePackage = findCustomBasePackage(packages)
    if (basePackage && selectedPackage !== basePackage.id) {
      setSelectedPackage(basePackage.id)
    }
  }, [isCustomMode, packages, selectedPackage])

  const currentPackage = packages.find((pkg) => pkg.id === selectedPackage) ?? packages[0]
  const extraGuests = Math.max(0, guests - currentPackage.capacity)
  const extraGuestsCost = extraGuests * currentPackage.extraPerGuest
  const selectedAddonEntries = addons
    .map((addon) => ({
      ...addon,
      quantity: selectedAddons[addon.id] ?? 0,
    }))
    .filter((addon) => addon.quantity > 0)
  const addonsCost = selectedAddonEntries.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
  const totalPrice = currentPackage.price + operationalFee + extraGuestsCost + addonsCost
  const selectedDateLabel = selectedDate ? formatDate(parseLocalDate(selectedDate)) : 'A definir'

  const reservationNotes = useMemo(() => {
    const customNotes = isCustomMode ? buildCustomNotes(customDetails) : ''
    return [customNotes, customerInfo.notes.trim()].filter(Boolean).join('\n\n')
  }, [customerInfo.notes, customDetails, isCustomMode])

  const handleNext = () => {
    if (step === 1) {
      if (!selectedDate) {
        setDateError('Selecione a data do evento para continuar.')
        return
      }
      setDateError('')
    }
    if (step < 3) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleStepSelect = (stepNumber: number) => {
    if (stepNumber <= step) {
      setStep(stepNumber)
      return
    }

    if (stepNumber === step + 1) {
      handleNext()
    }
  }

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    setSelectedAddons((current) => {
      const next = { ...current }
      const normalizedQuantity = Math.max(0, Math.min(20, Math.round(quantity)))

      if (normalizedQuantity === 0) {
        delete next[addonId]
      } else {
        next[addonId] = normalizedQuantity
      }

      return next
    })
  }

  const handleSubmit = async () => {
    setSubmitError('')

    if (!selectedDate) {
      setStep(1)
      setDateError('Selecione a data do evento para continuar.')
      return
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim()) {
      setSubmitError('Informe pelo menos nome e email para concluirmos a solicitação.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      date: selectedDate,
      guests,
      packageId: selectedPackage,
      addons: selectedAddonEntries.map((addon) => ({
        id: addon.id,
        quantity: addon.quantity,
      })),
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        notes: reservationNotes || undefined,
      },
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Falha ao registrar a reserva')
      }

      setShowSuccess(true)
      setTimeout(() => router.push('/'), 2500)
    } catch (err) {
      console.error(err)
      setSubmitError(`Ocorreu um erro ao enviar sua reserva. ${err instanceof Error ? err.message : ''}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Header />

      <main className="pt-24">
        <section className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto w-full max-w-[100vw] px-4 py-12 sm:px-6 md:py-16 lg:max-w-[1400px] lg:px-8">
            <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div className="min-w-0 max-w-[calc(100vw-2rem)] lg:max-w-none">
                <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-emerald-100">
                  {isCustomMode ? <SlidersHorizontal className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
                  {isCustomMode ? 'Proposta personalizada' : 'Solicitação de reserva'}
                </div>
                <h1 className="mt-5 max-w-3xl break-words text-3xl font-black leading-tight tracking-normal sm:text-4xl md:text-6xl">
                  {isCustomMode ? 'Monte uma proposta com a estrutura certa.' : 'Reserve com contexto, clareza e controle.'}
                </h1>
                <p className="mt-5 max-w-[min(42rem,100%)] break-words text-base leading-7 text-slate-300 md:text-lg">
                  {isCustomMode
                    ? 'Informe data, público e necessidades do evento. O dashboard recebe tudo como briefing para o operador transformar em proposta.'
                    : 'Escolha um pacote, informe a data e envie uma solicitação pronta para análise operacional.'}
                </p>
              </div>

              <div className="max-w-[calc(100vw-2rem)] rounded-md border border-white/10 bg-white/5 p-5 lg:max-w-none">
                <p className="text-sm font-semibold uppercase text-emerald-200">Estimativa atual</p>
                <div className="mt-3 text-4xl font-black">{formatCurrency(totalPrice)}</div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Valor sujeito à confirmação. Pacotes, taxa operacional e adicionais vêm do catálogo editável do dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[100vw] px-4 py-10 sm:px-6 md:py-12 lg:max-w-[1400px] lg:px-8">
          <div className="mx-auto w-full max-w-[calc(100vw-2rem)] lg:max-w-6xl">
            {showSuccess && (
              <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    <p className="font-semibold">Solicitação enviada com sucesso.</p>
                    <p className="mt-1 text-sm text-emerald-900/80">
                      Entraremos em contato para confirmação. Você será redirecionado para a página inicial em instantes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm">{submitError}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitError('')}
                    className="text-lg leading-none text-red-700 opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Fechar erro"
                  >
                    x
                  </button>
                </div>
              </div>
            )}

            <div className="mb-8 grid gap-3 md:grid-cols-3">
              {stepLabels.map((label, index) => {
                const stepNumber = index + 1
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleStepSelect(stepNumber)}
                    disabled={stepNumber > step + 1}
                    className={cn(
                      'flex h-14 items-center gap-3 rounded-md border px-4 text-left transition-colors',
                      step >= stepNumber
                        ? 'border-emerald-500 bg-white text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-white/70 text-slate-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold',
                        step >= stepNumber ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {stepNumber}
                    </span>
                    <span className="font-semibold">{label}</span>
                  </button>
                )
              })}
            </div>

            <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="overflow-hidden border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-200 bg-white p-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase text-emerald-700">Etapa {step} de 3</p>
                      <CardTitle className="mt-2 text-2xl font-bold text-slate-950">
                        {step === 1 && 'Agenda e porte do evento'}
                        {step === 2 && (isCustomMode ? 'Base da proposta' : 'Escolha do pacote')}
                        {step === 3 && 'Dados para retorno'}
                      </CardTitle>
                    </div>
                    {isCustomMode && (
                      <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                        <Sparkles className="h-4 w-4" />
                        Briefing sob medida
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-7 bg-white p-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <Label htmlFor="date" className="text-sm font-semibold text-slate-800">
                            Data do evento *
                          </Label>
                          <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                            <CalendarDays className="h-5 w-5 text-slate-500" />
                            <Input
                              id="date"
                              type="date"
                              value={selectedDate}
                              onChange={(e) => {
                                setSelectedDate(e.target.value)
                                if (e.target.value) setDateError('')
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              required
                            />
                          </div>
                          {dateError && <p className="mt-2 text-sm text-red-600">{dateError}</p>}
                        </div>

                        <div>
                          <Label htmlFor="guests" className="text-sm font-semibold text-slate-800">
                            Número de convidados *
                          </Label>
                          <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                            <Users className="h-5 w-5 text-slate-500" />
                            <Input
                              id="guests"
                              type="number"
                              min={1}
                              max={1000}
                              value={guests}
                              onChange={(e) => {
                                const value = parseInt(e.target.value || '0', 10)
                                if (Number.isNaN(value)) {
                                  setGuests(1)
                                } else {
                                  setGuests(Math.max(1, Math.min(1000, value)))
                                }
                              }}
                              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            O pacote selecionado inclui até {currentPackage.capacity} pessoas. Extras são calculados automaticamente.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Data</p>
                          <p className="mt-1 font-semibold text-slate-950">{selectedDateLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Público</p>
                          <p className="mt-1 font-semibold text-slate-950">{guests} pessoas</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Taxa operacional</p>
                          <p className="mt-1 font-semibold text-slate-950">{formatCurrency(operationalFee)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {isCustomMode && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex gap-3">
                            <SlidersHorizontal className="mt-0.5 h-5 w-5 text-emerald-700" />
                            <div>
                              <p className="font-semibold text-emerald-950">Escolha um pacote como referência de orçamento.</p>
                              <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                                A proposta final poderá combinar duração, equipe, montagem, fornecedores e adicionais fora do catálogo padrão.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {packages.map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            className={cn(
                              'w-full rounded-md border-2 p-4 text-left transition-colors',
                              selectedPackage === pkg.id
                                ? 'border-emerald-600 bg-emerald-50'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            )}
                            onClick={() => setSelectedPackage(pkg.id)}
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-xl font-bold text-slate-950">{pkg.name}</h3>
                                  {pkg.popular && (
                                    <span className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                      Recomendado
                                    </span>
                                  )}
                                  {isCustomMode && selectedPackage === pkg.id && (
                                    <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white">
                                      Base da proposta
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {pkg.duration} · Até {pkg.capacity} pessoas · {formatCurrency(pkg.extraPerGuest)} por convidado extra
                                </p>
                                <ul className="mt-3 grid gap-2 md:grid-cols-2">
                                  {pkg.features.slice(0, 4).map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                                      <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="text-left md:text-right">
                                <p className="text-sm font-medium text-slate-500">A partir de</p>
                                <p className="text-2xl font-black text-slate-950">{formatCurrency(pkg.price)}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {addons.length > 0 && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold uppercase text-emerald-700">Adicionais</p>
                              <h3 className="mt-1 text-xl font-bold text-slate-950">Monte uma estimativa mais completa</h3>
                            </div>
                            <p className="text-sm font-semibold text-slate-950">{formatCurrency(addonsCost)}</p>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            {addons.map((addon) => {
                              const quantity = selectedAddons[addon.id] ?? 0
                              return (
                                <div key={addon.id} className="rounded-md border border-slate-200 bg-white p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <p className="font-semibold text-slate-950">{addon.name}</p>
                                      <p className="mt-1 text-sm leading-6 text-slate-600">{addon.description}</p>
                                      <p className="mt-2 text-sm font-semibold text-slate-950">{formatCurrency(addon.price)}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center rounded-md border border-slate-200">
                                      <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                                        onClick={() => updateAddonQuantity(addon.id, quantity - 1)}
                                        disabled={quantity === 0}
                                        aria-label={`Remover ${addon.name}`}
                                      >
                                        -
                                      </button>
                                      <span className="flex h-9 w-9 items-center justify-center border-x border-slate-200 text-sm font-semibold text-slate-950">
                                        {quantity}
                                      </span>
                                      <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50"
                                        onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                                        aria-label={`Adicionar ${addon.name}`}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {isCustomMode && (
                        <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="eventType" className="text-sm font-semibold text-slate-800">
                              Tipo de evento
                            </Label>
                            <Input
                              id="eventType"
                              value={customDetails.eventType}
                              maxLength={80}
                              onChange={(e) => setCustomDetails((prev) => ({ ...prev, eventType: e.target.value }))}
                              placeholder="Casamento, corporativo, aniversário..."
                              className="mt-2 bg-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="desiredDuration" className="text-sm font-semibold text-slate-800">
                              Duração desejada
                            </Label>
                            <Input
                              id="desiredDuration"
                              value={customDetails.desiredDuration}
                              maxLength={80}
                              onChange={(e) => setCustomDetails((prev) => ({ ...prev, desiredDuration: e.target.value }))}
                              placeholder="Diária, noite, montagem estendida..."
                              className="mt-2 bg-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="budgetRange" className="text-sm font-semibold text-slate-800">
                              Faixa de investimento
                            </Label>
                            <Input
                              id="budgetRange"
                              value={customDetails.budgetRange}
                              maxLength={80}
                              onChange={(e) => setCustomDetails((prev) => ({ ...prev, budgetRange: e.target.value }))}
                              placeholder="Ex.: até R$ 8.000"
                              className="mt-2 bg-white"
                            />
                          </div>
                          <div className="md:row-span-2">
                            <Label htmlFor="requirements" className="text-sm font-semibold text-slate-800">
                              Necessidades principais
                            </Label>
                            <textarea
                              id="requirements"
                              value={customDetails.requirements}
                              maxLength={500}
                              onChange={(e) => setCustomDetails((prev) => ({ ...prev, requirements: e.target.value }))}
                              rows={5}
                              className="mt-2 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              placeholder="Estrutura, decoração, fornecedores, montagem, som, buffet..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <Label htmlFor="name" className="text-sm font-semibold text-slate-800">
                            Nome completo *
                          </Label>
                          <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                            <User className="h-5 w-5 text-slate-500" />
                            <Input
                              id="name"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
                            Email *
                          </Label>
                          <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                            <Mail className="h-5 w-5 text-slate-500" />
                            <Input
                              id="email"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                              className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-slate-800">
                          Telefone *
                        </Label>
                        <div className="mt-2 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-500 focus-within:bg-white">
                          <Phone className="h-5 w-5 text-slate-500" />
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                            className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-sm font-semibold text-slate-800">
                          Observações
                        </Label>
                        <textarea
                          id="notes"
                          value={customerInfo.notes}
                          maxLength={600}
                          onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                          rows={4}
                          className="mt-2 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Alguma observação especial sobre o evento?"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          {isCustomMode
                            ? 'O briefing sob medida será anexado automaticamente ao pedido.'
                            : 'Essas informações ajudam o operador a confirmar a reserva com mais precisão.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>

                    {step < 3 ? (
                      <Button onClick={handleNext} disabled={step === 1 && !selectedDate}>
                        Próximo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando...' : isCustomMode ? 'Enviar proposta' : 'Finalizar reserva'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-950 p-5 text-white">
                    <CardTitle className="text-xl">Resumo</CardTitle>
                    <p className="text-sm text-slate-300">
                      {isCustomMode ? 'Estimativa para proposta personalizada' : 'Valores calculados para a solicitação'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5 bg-white p-5">
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <CalendarDays className="mt-0.5 h-5 w-5 text-emerald-700" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Data</p>
                          <p className="text-sm text-slate-600">{selectedDateLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="mt-0.5 h-5 w-5 text-emerald-700" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Convidados</p>
                          <p className="text-sm text-slate-600">{guests} pessoas</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="mt-0.5 h-5 w-5 text-emerald-700" />
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Pacote base</p>
                          <p className="text-sm text-slate-600">{currentPackage.name}</p>
                          <p className="text-xs text-slate-500">{currentPackage.duration}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-slate-600">Pacote</span>
                        <span className="font-medium text-slate-950">{formatCurrency(currentPackage.price)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-sm">
                        <span className="text-slate-600">Taxa operacional</span>
                        <span className="font-medium text-slate-950">{formatCurrency(operationalFee)}</span>
                      </div>
                      {extraGuests > 0 && (
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-slate-600">{extraGuests} convidados extras</span>
                          <span className="font-medium text-slate-950">{formatCurrency(extraGuestsCost)}</span>
                        </div>
                      )}
                      {selectedAddonEntries.map((addon) => (
                        <div key={addon.id} className="flex justify-between gap-4 text-sm">
                          <span className="text-slate-600">{addon.quantity}x {addon.name}</span>
                          <span className="font-medium text-slate-950">{formatCurrency(addon.price * addon.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-950">Total estimado</span>
                        <span className="text-2xl font-black text-slate-950">{formatCurrency(totalPrice)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {isCustomMode
                          ? 'A proposta final pode variar conforme escopo, fornecedores e duração.'
                          : 'Preço sujeito à confirmação de disponibilidade e operação.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex gap-3">
                    <WalletCards className="mt-0.5 h-5 w-5 text-emerald-700" />
                    <div>
                      <p className="font-semibold text-slate-950">Sem pagamento nesta etapa</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        O pedido entra como pendente no dashboard para análise, contato e confirmação manual.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
