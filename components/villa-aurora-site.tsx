'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { fallbackAddonOptions, fallbackPackageOptions, isExpectedCatalogIdentity } from '@/lib/catalog'
import { buildPublicBookingSelection, reconcileSelectedPackageId } from '@/lib/public-booking'
import { siteConfig } from '@/lib/site'
import { formatCurrency } from '@/lib/utils'
import type { AddonOption, CatalogResponse, PackageOption } from '@/types/booking'

const gallery = [
  { src: '/gallery/reception-hall.jpg', name: 'Salão principal', description: 'Amplitude e flexibilidade para receber cada detalhe da celebração.' },
  { src: '/gallery/pool-garden.jpg', name: 'Deck da piscina', description: 'Luz, paisagem e uma atmosfera perfeita para receber.' },
  { src: '/gallery/venue-exterior.jpg', name: 'Área externa', description: 'Integração entre a celebração e a paisagem.' },
]


const eventTypes = ['Casamento', 'Aniversário', 'Confraternização', 'Evento corporativo', 'Formatura', 'Ensaio', 'Celebração familiar', 'Outro']

const faqs = [
  ['Como a reserva é confirmada?', 'Após o envio, nossa equipe confere a disponibilidade, alinha os detalhes e encaminha a proposta. A reserva só é confirmada depois da aprovação e do pagamento do sinal.'],
  ['Quais são as formas de pagamento?', 'As condições são apresentadas na proposta, com sinal para confirmação e saldo parcelado até a data do evento.'],
  ['Como funciona o cancelamento?', 'As regras e os prazos de cancelamento constam no contrato e variam conforme a antecedência da solicitação.'],
  ['Qual é a capacidade máxima?', 'A Villa Aurora recebe até 250 convidados, respeitando o formato e a estrutura definidos para cada evento.'],
  ['Posso incluir convidados extras?', 'Sim. Cada pacote possui uma quantidade incluída e um valor individual para convidados adicionais, até o limite do espaço.'],
  ['Quais horários estão disponíveis?', 'Trabalhamos com períodos de 6, 10 ou 14 horas. Horas adicionais podem ser contratadas conforme a agenda.'],
  ['Posso contratar meus próprios fornecedores?', 'Sim. Buffet, decoração e outros fornecedores são livres, desde que respeitem as regras operacionais e os horários do espaço.'],
  ['É possível visitar antes de reservar?', 'Sim. As visitas são agendadas para que você conheça todos os ambientes com tranquilidade.'],
  ['Vocês recebem eventos personalizados?', 'Sim. Para formatos fora dos pacotes, envie um pedido sob medida e nossa equipe prepara uma proposta específica.'],
]

type BookingForm = {
  date: string
  eventType: string
  guests: number
  packageId: string
  addons: string[]
  name: string
  phone: string
  email: string
  needs: string
  notes: string
}

const initialBooking: BookingForm = {
  date: '',
  eventType: 'Casamento',
  guests: 80,
  packageId: reconcileSelectedPackageId(fallbackPackageOptions, ''),
  addons: [],
  name: '',
  phone: '',
  email: '',
  needs: '',
  notes: '',
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function longDate(value: string) {
  if (!value) return 'Nenhuma data selecionada'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T12:00:00Z`))
}

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`va-wordmark ${light ? 'is-light' : ''}`}>
      <strong>Villa Aurora</strong>
      <small>espaço de eventos</small>
    </span>
  )
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="va-section-intro">
      <span className="va-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function MiniCalendar({ value, onChange, dark = false }: { value: string; onChange: (value: string) => void; dark?: boolean }) {
  const [month, setMonth] = useState(() => {
    const next = new Date()
    next.setMonth(next.getMonth() + 1)
    return new Date(next.getFullYear(), next.getMonth(), 1)
  })
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
  const [availability, setAvailability] = useState<{
    month: string
    status: 'loading' | 'ready' | 'error'
    dates: Set<string>
  }>({ month: monthKey, status: 'loading', dates: new Set() })

  useEffect(() => {
    const controller = new AbortController()
    setAvailability({ month: monthKey, status: 'loading', dates: new Set() })

    fetch(`/api/availability?month=${monthKey}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('availability unavailable')
        return response.json() as Promise<{ unavailableDates?: string[] }>
      })
      .then((result) => {
        const dates = new Set(result.unavailableDates ?? [])
        setAvailability({ month: monthKey, status: 'ready', dates })
        if (value && dates.has(value)) onChange('')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setAvailability({ month: monthKey, status: 'error', dates: new Set() })
      })

    return () => controller.abort()
    // `value` is intentionally read only when a month response arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey])

  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const cells = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first)
    date.setDate(index - first.getDay() + 1)
    return date
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentStatus = availability.month === monthKey ? availability.status : 'loading'

  return (
    <div className={`va-calendar ${dark ? 'is-dark' : ''}`} aria-busy={currentStatus === 'loading'}>
      <div className="va-calendar-head">
        <button type="button" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></button>
        <strong>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(month)}</strong>
        <button type="button" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></button>
      </div>
      <div className="va-calendar-grid va-weekdays">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="va-calendar-grid">
        {cells.map((date) => {
          const dateIso = isoDate(date)
          const otherMonth = date.getMonth() !== month.getMonth()
          const past = date < today
          const unavailable = availability.dates.has(dateIso)
          const disabled = otherMonth || past || unavailable || currentStatus !== 'ready'
          const title = unavailable
            ? 'Data indisponível'
            : past
              ? 'Data passada'
              : otherMonth
                ? 'Fora do mês atual'
                : currentStatus === 'error'
                  ? 'Disponibilidade temporariamente indisponível'
                  : currentStatus === 'loading'
                    ? 'Consultando disponibilidade'
                    : 'Data livre para solicitação'
          return (
            <button
              type="button"
              key={dateIso}
              className={`${value === dateIso ? 'is-selected' : ''} ${unavailable ? 'is-unavailable' : ''}`.trim()}
              disabled={disabled}
              title={title}
              onClick={() => onChange(dateIso)}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      <p className="va-field-note" role="status">
        {currentStatus === 'loading' && 'Consultando datas disponíveis...'}
        {currentStatus === 'error' && 'Não foi possível consultar a agenda. Tente novamente em instantes.'}
        {currentStatus === 'ready' && 'Datas desabilitadas não estão disponíveis para solicitação.'}
      </p>
    </div>
  )
}

export function VillaAuroraSite() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const touchStart = useRef(0)
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null)
  const [catalogStatus, setCatalogStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [form, setForm] = useState<BookingForm>(initialBooking)
  const [step, setStep] = useState(1)
  const [flow, setFlow] = useState<'steps' | 'single'>('steps')
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [bookingMessage, setBookingMessage] = useState('')
  const [protocol, setProtocol] = useState('')
  const [faqOpen, setFaqOpen] = useState(0)
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [quoteStatus, setQuoteStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const loadCatalog = useCallback(async () => {
    setCatalogStatus('loading')
    try {
      const response = await fetch('/api/catalog', { cache: 'no-store' })
      if (!response.ok) throw new Error('catalog unavailable')
      const nextCatalog = await response.json() as CatalogResponse
      if (!nextCatalog.packages?.length || !Array.isArray(nextCatalog.addons)) {
        throw new Error('invalid catalog')
      }
      if (!isExpectedCatalogIdentity(nextCatalog.property, siteConfig.venueName)) {
        throw new Error('unexpected property identity')
      }
      setCatalog(nextCatalog)
      setCatalogStatus('ready')
      setForm((current) => ({
        ...current,
        packageId: reconcileSelectedPackageId(nextCatalog.packages, current.packageId),
        addons: current.addons.filter((id) => nextCatalog.addons.some((addon) => addon.id === id)),
      }))
      return nextCatalog
    } catch (error) {
      setCatalogStatus('error')
      throw error
    }
  }, [])

  useEffect(() => {
    void loadCatalog().catch(() => undefined)
  }, [loadCatalog])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setGalleryIndex((index) => (index - 1 + gallery.length) % gallery.length)
      if (event.key === 'ArrowRight') setGalleryIndex((index) => (index + 1) % gallery.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const packages: PackageOption[] = catalog?.packages?.length ? catalog.packages : fallbackPackageOptions
  const addons: AddonOption[] = catalog ? catalog.addons : fallbackAddonOptions
  const operationalFee = catalog?.property.operationalFee ?? siteConfig.cleaningFee
  const maxCapacity = catalog?.property.capacity ?? siteConfig.capacity
  const chosenPackage = packages.find((item) => item.id === form.packageId) ?? packages.find((item) => item.popular) ?? packages[0]
  const bookingSelection = useMemo(
    () => buildPublicBookingSelection({
      package: chosenPackage,
      addons,
      selectedAddonIds: form.addons,
      guestCount: form.guests,
      operationalFee,
    }),
    [addons, chosenPackage, form.addons, form.guests, operationalFee]
  )
  const extraGuests = bookingSelection.extraGuests
  const addonsTotal = bookingSelection.addonsCost
  const fee = operationalFee
  const total = bookingSelection.totalAmount
  const contactEmail = catalog?.property.contactEmail || siteConfig.email
  const contactPhone = catalog?.property.contactPhone || siteConfig.phone
  const contactAddress = catalog?.property.address || siteConfig.address

  const updateForm = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => setForm((current) => ({ ...current, [key]: value }))
  const toggleAddon = (id: string) => updateForm('addons', form.addons.includes(id) ? form.addons.filter((item) => item !== id) : [...form.addons, id])

  const selectPackage = (packageId: string, moveToBooking = false) => {
    updateForm('packageId', packageId)
    if (moveToBooking) {
      setStep(2)
      document.querySelector('#reservar')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const nextStep = () => {
    if (step === 1 && !form.date) {
      setBookingStatus('error')
      setBookingMessage('Escolha uma data disponível para continuar.')
      return
    }
    setBookingStatus('idle')
    setStep((current) => Math.min(4, current + 1))
  }

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.date) {
      setStep(1)
      setBookingStatus('error')
      setBookingMessage('Escolha uma data disponível para continuar.')
      return
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStep(4)
      setBookingStatus('error')
      setBookingMessage('Informe nome, e-mail e telefone para enviar a solicitação.')
      return
    }
    if (catalogStatus !== 'ready') {
      setBookingStatus('error')
      setBookingMessage('O catálogo está temporariamente indisponível. Tente novamente em instantes.')
      return
    }

    setBookingStatus('sending')
    setBookingMessage('')
    const selectedNames = bookingSelection.selectedAddons.map((addon) => addon.name)
    const notes = [
      `Tipo de evento: ${form.eventType}`,
      `Pacote de referência: ${chosenPackage.name}`,
      selectedNames.length ? `Adicionais desejados: ${selectedNames.join(', ')}` : '',
      form.needs ? `Necessidades específicas: ${form.needs}` : '',
      form.notes ? `Observações: ${form.notes}` : '',
    ].filter(Boolean).join('\n')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          guests: form.guests,
          packageId: chosenPackage.id,
          addons: bookingSelection.addonPayload,
          expectedTotal: total,
          customer: { name: form.name, email: form.email, phone: form.phone, notes },
        }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        if (data?.code === 'CATALOG_CHANGED') {
          await loadCatalog().catch(() => undefined)
          throw new Error('O catálogo foi atualizado. Confira a nova estimativa antes de enviar novamente.')
        }
        throw new Error(data?.error || 'Não foi possível enviar a solicitação.')
      }
      setProtocol(`VA-${String(data.bookingId || Date.now()).slice(-6).toUpperCase()}`)
      setBookingStatus('success')
    } catch (error) {
      setBookingStatus('error')
      setBookingMessage(error instanceof Error ? error.message : 'Não foi possível enviar a solicitação.')
    }
  }

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (catalogStatus !== 'ready') {
      setContactStatus('error')
      return
    }
    setContactStatus('sending')
    const fields = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          email: fields.get('email'),
          phone: fields.get('phone'),
          subject: 'Contato pelo site Villa Aurora',
          message: fields.get('message'),
        }),
      })
      if (!response.ok) throw new Error()
      setContactStatus('success')
      event.currentTarget.reset()
    } catch {
      setContactStatus('error')
    }
  }

  const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setQuoteStatus('sending')
    const fields = new FormData(event.currentTarget)
    if (catalogStatus !== 'ready') return setQuoteStatus('error')
    const base = packages.find((item) => item.popular) ?? packages[0]
    if (!base) return setQuoteStatus('error')
    try {
      const description = String(fields.get('description') || '')
      const guests = Number(fields.get('guests'))
      const selection = buildPublicBookingSelection({
        package: base,
        addons,
        selectedAddonIds: [],
        guestCount: guests,
        operationalFee,
      })
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: fields.get('date'),
          guests,
          packageId: base.id,
          addons: [],
          expectedTotal: selection.totalAmount,
          customer: {
            name: fields.get('name'),
            email: fields.get('email'),
            phone: fields.get('phone'),
            notes: `[Pacote sob medida]\nTipo de evento: Personalizado\nNecessidades principais: ${description}`,
          },
        }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        if (data?.code === 'CATALOG_CHANGED') await loadCatalog().catch(() => undefined)
        throw new Error()
      }
      setQuoteStatus('success')
      event.currentTarget.reset()
    } catch {
      setQuoteStatus('error')
    }
  }

  const renderDateStep = () => (
    <div className="va-form-block">
      <div className="va-form-heading"><span>01</span><div><h3>Quando será?</h3><p>Escolha uma data livre e conte qual será a celebração.</p></div></div>
      <MiniCalendar value={form.date} onChange={(date) => updateForm('date', date)} dark />
      <label>Tipo de evento<select value={form.eventType} onChange={(event) => updateForm('eventType', event.target.value)}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
    </div>
  )

  const renderPackageStep = () => (
    <div className="va-form-block">
      <div className="va-form-heading"><span>02</span><div><h3>Escolha o pacote</h3><p>Você poderá ajustar todos os detalhes antes da confirmação.</p></div></div>
      <div className="va-choice-list">
        {packages.map((item) => (
          <button type="button" key={item.id} className={form.packageId === item.id ? 'is-selected' : ''} onClick={() => updateForm('packageId', item.id)}>
            <span className="va-radio" /><span><strong>{item.name}</strong><small>{item.duration} · até {item.capacity} convidados</small></span><b>{formatCurrency(item.price)}</b>
          </button>
        ))}
      </div>
      <label>Número de convidados<input type="number" min="1" max={maxCapacity} value={form.guests} onChange={(event) => updateForm('guests', Math.min(maxCapacity, Math.max(1, Number(event.target.value))))} /></label>
      {extraGuests > 0 && <p className="va-field-note">{extraGuests} convidado(s) adicional(is) entram na estimativa.</p>}
    </div>
  )

  const renderAddonsStep = () => (
    <div className="va-form-block">
      <div className="va-form-heading"><span>03</span><div><h3>Complete a experiência</h3><p>Selecione somente o que fizer sentido para o seu evento.</p></div></div>
      <div className="va-form-addons">
        {addons.map((addon) => (
          <button type="button" key={addon.id} className={form.addons.includes(addon.id) ? 'is-selected' : ''} onClick={() => toggleAddon(addon.id)} disabled={catalogStatus !== 'ready'}>
            <span>{form.addons.includes(addon.id) && <Check />}</span><div><strong>{addon.name}</strong><small>{formatCurrency(addon.price)}</small></div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderDataStep = () => (
    <div className="va-form-block">
      <div className="va-form-heading"><span>04</span><div><h3>Seus dados</h3><p>Entraremos em contato para confirmar cada detalhe.</p></div></div>
      <div className="va-field-grid">
        <label>Nome do responsável<input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} /></label>
        <label>Telefone / WhatsApp<input required value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} /></label>
      </div>
      <label>E-mail<input type="email" required value={form.email} onChange={(event) => updateForm('email', event.target.value)} /></label>
      <label>Necessidades específicas<textarea rows={3} value={form.needs} onChange={(event) => updateForm('needs', event.target.value)} placeholder="Acessibilidade, estrutura, fornecedores..." /></label>
      <label>Observações<textarea rows={3} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Conte o que considera importante para a celebração." /></label>
    </div>
  )

  return (
    <main className="villa-aurora">
      <div className="va-demo">Demonstração funcional — LPeM Software · dados e imagens ilustrativos</div>
      <header className="va-header">
        <div className="va-container">
          <a href="#inicio" aria-label="Villa Aurora, início"><Wordmark /></a>
          <nav className={menuOpen ? 'is-open' : ''}>
            {[
              ['O espaço', 'espaco'], ['Ambientes', 'ambientes'], ['Pacotes', 'pacotes'],
              ['Disponibilidade', 'disponibilidade'], ['Dúvidas', 'duvidas'], ['Contato', 'contato'],
            ].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
            <a className="va-header-cta" href="#reservar" onClick={() => setMenuOpen(false)}>Solicitar reserva</a>
          </nav>
          <button type="button" className="va-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="va-hero" id="inicio">
        <div className="va-container">
          <span className="va-eyebrow">Serra da Cantareira · até 250 convidados</span>
          <h1>O dia mais importante<br />da sua vida merece<br /><em>um lugar inteiro</em></h1>
          <p>Um espaço exclusivo, cercado pela natureza e preparado<br /> para celebrar histórias que ficam para sempre.</p>
          <div className="va-actions">
            <a className="va-button is-dark" href="#disponibilidade">Ver datas disponíveis</a>
            <a className="va-button is-outline" href="#pacotes">Conhecer pacotes</a>
          </div>
          <div className="va-hero-deck" aria-label="Ambientes da Villa Aurora">
            {gallery.map((item, index) => (
              <div className={`va-hero-photo photo-${index + 1}`} key={item.name}>
                <Image src={item.src} alt={item.name} fill sizes="(max-width: 800px) 75vw, 34vw" priority={index === 1} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="va-about" id="espaco">
        <div className="va-container">
          <div className="va-about-copy">
            <SectionIntro eyebrow="O espaço" title="Seu evento, sem dividir o protagonismo." />
            <div>
              <p className="va-lead">Na Villa Aurora, cada data pertence a uma única história. Você recebe o espaço inteiro, a atenção da equipe e a liberdade de criar uma celebração verdadeiramente sua.</p>
              <div className="va-differentials">
                {[
                  ['Exclusividade diária', 'Apenas um evento por dia, do primeiro preparo ao último brinde.'],
                  ['Estrutura pronta', 'Ambientes integrados, acessíveis e pensados para receber bem.'],
                  ['Buffet livre', 'Escolha os fornecedores que combinam com a sua celebração.'],
                  ['Plano B para chuva', 'Espaços cobertos preservam o roteiro sem perder a beleza.'],
                ].map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}
              </div>
            </div>
          </div>
          <div className="va-event-pills">
            {['Casamentos', 'Aniversários', 'Mini weddings', 'Eventos corporativos', 'Bodas', 'Formaturas', 'Ensaios', 'Celebrações'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>

      <section className="va-gallery-section" id="ambientes">
        <div className="va-container">
          <div className="va-section-row">
            <SectionIntro eyebrow="Ambientes" title="Um cenário para cada momento." />
            <div className="va-gallery-arrows">
              <button type="button" onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} aria-label="Ambiente anterior"><ArrowLeft /></button>
              <button type="button" onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} aria-label="Próximo ambiente"><ArrowRight /></button>
            </div>
          </div>
          <div
            className="va-coverflow"
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX }}
            onTouchEnd={(event) => {
              const delta = event.changedTouches[0].clientX - touchStart.current
              if (Math.abs(delta) > 45) setGalleryIndex((galleryIndex + (delta < 0 ? 1 : -1) + gallery.length) % gallery.length)
            }}
          >
            {gallery.map((item, index) => {
              let offset = index - galleryIndex
              if (offset > gallery.length / 2) offset -= gallery.length
              if (offset < -gallery.length / 2) offset += gallery.length
              return (
                <button
                  type="button"
                  key={item.name}
                  className="va-gallery-card"
                  style={{ '--offset': offset, '--distance': Math.abs(offset) } as React.CSSProperties}
                  onClick={() => setGalleryIndex(index)}
                  tabIndex={Math.abs(offset) <= 1 ? 0 : -1}
                >
                  <Image src={item.src} alt="" fill sizes="(max-width: 700px) 86vw, 560px" />
                  <span><strong>{item.name}</strong><small>{item.description}</small></span>
                </button>
              )
            })}
          </div>
          <div className="va-gallery-dots">{gallery.map((item, index) => <button type="button" key={item.name} className={index === galleryIndex ? 'is-active' : ''} onClick={() => setGalleryIndex(index)} aria-label={`Ver ${item.name}`} />)}</div>
        </div>
      </section>

      <section className="va-packages" id="pacotes">
        <div className="va-container">
          <SectionIntro eyebrow="Pacotes" title="Escolha o ritmo da sua celebração." text="Três pontos de partida. Todos podem ser ajustados depois da sua solicitação." />
          {catalogStatus === 'error' && <p className="va-form-error" role="alert">O catálogo está temporariamente indisponível. Os valores abaixo são apenas uma referência local e o envio foi desabilitado. <button type="button" onClick={() => void loadCatalog().catch(() => undefined)}>Tentar novamente</button></p>}
          <div className="va-package-grid">
            {packages.map((item) => (
              <article key={item.name} className={item.popular ? 'is-popular' : ''}>
                {item.popular && <span className="va-popular-tag">Mais escolhido</span>}
                <h3>{item.name}</h3><p>{item.description}</p>
                <span className="va-from">a partir de</span><strong className="va-price">{formatCurrency(item.price)}</strong>
                <dl>
                  <div><dt>Duração</dt><dd>{item.duration}</dd></div>
                  <div><dt>Convidados inclusos</dt><dd>{item.capacity}</dd></div>
                  <div><dt>Convidado adicional</dt><dd>{formatCurrency(item.extraPerGuest)}</dd></div>
                </dl>
                <ul>{item.features.map((feature) => <li key={feature}><Check />{feature}</li>)}{item.notIncluded.map((feature) => <li className="is-muted" key={feature}><span>—</span>{feature}</li>)}</ul>
                <button type="button" className={`va-button ${item.popular ? 'is-accent' : 'is-dark'}`} onClick={() => selectPackage(item.id, true)}>Escolher {item.name}</button>
              </article>
            ))}
          </div>
          <div className="va-custom-strip"><div><strong>Nenhum deles serve exatamente?</strong><span>Conte o que você imagina e montamos uma proposta sob medida.</span></div><a href="#orcamento">Pedir orçamento personalizado <ArrowRight /></a></div>
        </div>
      </section>

      <section className="va-addons">
        <div className="va-container va-addons-layout">
          <div><SectionIntro eyebrow="Serviços adicionais" title="Os detalhes que completam a experiência." /><div className="va-addons-total"><span>Total selecionado</span><strong>{formatCurrency(addonsTotal)}</strong></div></div>
          <div className="va-addon-grid">
            {addons.map((addon) => (
              <button type="button" key={addon.id} className={form.addons.includes(addon.id) ? 'is-selected' : ''} onClick={() => toggleAddon(addon.id)} disabled={catalogStatus !== 'ready'}>
                <span className="va-checkbox">{form.addons.includes(addon.id) && <Check />}</span><span><strong>{addon.name}</strong><small>{addon.description}</small></span><b>{formatCurrency(addon.price)}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="va-availability" id="disponibilidade">
        <div className="va-container va-availability-grid">
          <div>
            <SectionIntro eyebrow="Disponibilidade" title="Sua data está livre?" text="Escolha uma data para começar. A disponibilidade é verificada novamente no envio da solicitação." />
            <div className="va-legend"><span><i className="free" />Livre para solicitação</span><span><i className="blocked" />Indisponível</span></div>
            <div className="va-selected-date"><CalendarDays /><div><span>Data escolhida</span><strong>{longDate(form.date)}</strong></div></div>
            <a href="#reservar" className="va-button is-dark" onClick={() => setStep(1)}>Continuar a solicitação</a>
          </div>
          <MiniCalendar value={form.date} onChange={(date) => updateForm('date', date)} />
        </div>
      </section>

      <section className="va-reservation" id="reservar">
        <div className="va-container">
          <div className="va-reservation-heading">
            <SectionIntro eyebrow="Solicitação de reserva" title="Vamos começar a desenhar o seu dia." />
            <div className="va-flow-toggle"><button type="button" className={flow === 'steps' ? 'is-active' : ''} onClick={() => setFlow('steps')}>Em etapas</button><button type="button" className={flow === 'single' ? 'is-active' : ''} onClick={() => setFlow('single')}>Página única</button></div>
          </div>
          {bookingStatus === 'success' ? (
            <div className="va-success">
              <span><Check /></span><h2>Recebemos a sua solicitação</h2><p>Protocolo <strong>{protocol}</strong></p>
              <div><h3>O que acontece agora</h3>{['Conferimos novamente a disponibilidade.', 'Entramos em contato para alinhar os detalhes.', 'Enviamos a proposta e as condições.', 'Após a aprovação, sua data é confirmada.'].map((item, index) => <p key={item}><b>{index + 1}</b>{item}</p>)}</div>
              <button type="button" className="va-button is-accent" onClick={() => { setForm(initialBooking); setBookingStatus('idle'); setStep(1) }}>Fazer outra solicitação</button>
            </div>
          ) : (
            <div className="va-reservation-grid">
              <form onSubmit={submitBooking}>
                {flow === 'steps' && <div className="va-steps">{['Data', 'Pacote', 'Adicionais', 'Dados'].map((label, index) => <button type="button" key={label} className={step === index + 1 ? 'is-active' : step > index + 1 ? 'is-complete' : ''} onClick={() => index + 1 <= step && setStep(index + 1)}><span>{step > index + 1 ? <Check /> : index + 1}</span>{label}</button>)}</div>}
                {flow === 'single' ? <>{renderDateStep()}{renderPackageStep()}{renderAddonsStep()}{renderDataStep()}</> : <>{step === 1 && renderDateStep()}{step === 2 && renderPackageStep()}{step === 3 && renderAddonsStep()}{step === 4 && renderDataStep()}</>}
                {bookingStatus === 'error' && <p className="va-form-error" role="alert">{bookingMessage}</p>}
                <div className="va-form-actions">
                  {flow === 'steps' && step > 1 && <button type="button" className="va-button is-dark-outline" onClick={() => setStep(step - 1)}><ChevronLeft />Voltar</button>}
                  {flow === 'steps' && step < 4 ? <button type="button" className="va-button is-accent" onClick={nextStep}>Avançar<ChevronRight /></button> : <button type="submit" className="va-button is-accent" disabled={bookingStatus === 'sending' || catalogStatus !== 'ready'}>{bookingStatus === 'sending' ? 'Enviando...' : catalogStatus === 'loading' ? 'Carregando catálogo...' : 'Enviar solicitação'}</button>}
                </div>
              </form>
              <aside className="va-estimate">
                <span className="va-eyebrow">Sua estimativa</span>
                <h3>{chosenPackage.name}</h3>
                <dl><div><dt>Pacote</dt><dd>{formatCurrency(chosenPackage.price)}</dd></div><div><dt>Convidados adicionais ({extraGuests})</dt><dd>{formatCurrency(bookingSelection.extraGuestsCost)}</dd></div><div><dt>Adicionais ({bookingSelection.selectedAddons.length})</dt><dd>{formatCurrency(addonsTotal)}</dd></div><div><dt>Taxa operacional</dt><dd>{formatCurrency(fee)}</dd></div></dl>
                <div className="va-estimate-total"><span>Total estimado</span><strong>{formatCurrency(total)}</strong></div>
                <p>Valor de referência, não contratual. A equipe confirma todos os itens antes da proposta.</p>
                <div className="va-estimate-meta"><span><CalendarDays />{form.date ? longDate(form.date) : 'Data a escolher'}</span><span><Sparkles />{form.eventType}</span><span><Users />{form.guests} convidados</span></div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <section className="va-quote" id="orcamento">
        <div className="va-container va-quote-grid">
          <div><SectionIntro eyebrow="Orçamento sob medida" title="Seu evento não cabe em uma caixa?" text="Conte sua ideia. Nós organizamos as necessidades e devolvemos uma proposta pensada para o seu formato." />{quoteStatus === 'success' && <p className="va-inline-success"><Check />Pedido recebido. Nossa equipe entrará em contato.</p>}</div>
          <form onSubmit={submitQuote} className="va-light-form">
            <div className="va-field-grid"><label>Nome<input name="name" required minLength={2} /></label><label>Telefone / WhatsApp<input name="phone" required /></label></div>
            <div className="va-field-grid"><label>E-mail<input name="email" type="email" required /></label><label>Data pretendida<input name="date" type="date" min={isoDate(new Date())} required /></label></div>
            <label>Número de convidados<input name="guests" type="number" min="1" max={maxCapacity} required /></label>
            <label>Descreva o evento<textarea name="description" rows={5} minLength={10} required placeholder="Formato, duração, ambientes, fornecedores e tudo o que considera importante." /></label>
            <p className="va-field-note">A solicitação entra no painel como reserva em análise e mantém a data indisponível até a avaliação da equipe.</p>
            {quoteStatus === 'error' && <p className="va-form-error">Não foi possível enviar agora. Tente novamente.</p>}
            <button className="va-button is-dark" disabled={quoteStatus === 'sending' || catalogStatus !== 'ready'}>{quoteStatus === 'sending' ? 'Enviando...' : catalogStatus === 'loading' ? 'Carregando catálogo...' : 'Enviar solicitação sob medida'}</button>
          </form>
        </div>
      </section>

      <section className="va-faq" id="duvidas">
        <div className="va-container va-faq-grid">
          <SectionIntro eyebrow="Dúvidas" title="Antes de escolher, é bom saber." />
          <div className="va-accordion">{faqs.map(([question, answer], index) => <div key={question} className={faqOpen === index ? 'is-open' : ''}><button type="button" onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}><span>{question}</span><i>+</i></button><p>{answer}</p></div>)}</div>
        </div>
      </section>

      <section className="va-contact" id="contato">
        <div className="va-container va-contact-grid">
          <div>
            <SectionIntro eyebrow="Contato" title="Conheça a Villa Aurora de perto." text="As visitas são feitas com hora marcada para que você explore cada ambiente com calma." />
            <address><span><MapPin />{contactAddress}</span>{contactPhone && <span><Phone />{contactPhone}</span>}<span><Mail />{contactEmail}</span><span><Clock3 />Visitas de terça a sábado, com agendamento</span></address>
          </div>
          <form onSubmit={submitContact} className="va-light-form">
            <div className="va-field-grid"><label>Nome<input name="name" required minLength={2} /></label><label>E-mail<input name="email" type="email" required /></label></div>
            <label>Telefone<input name="phone" /></label><label>Mensagem<textarea name="message" rows={5} minLength={10} required /></label>
            {contactStatus === 'success' && <p className="va-inline-success"><Check />Mensagem enviada. Retornaremos em breve.</p>}
            {contactStatus === 'error' && <p className="va-form-error">Não foi possível enviar agora. Tente novamente.</p>}
            <button className="va-button is-dark" disabled={contactStatus === 'sending' || catalogStatus !== 'ready'}>{contactStatus === 'sending' ? 'Enviando...' : catalogStatus === 'loading' ? 'Carregando catálogo...' : 'Enviar mensagem'}</button>
          </form>
        </div>
      </section>

      <footer className="va-footer">
        <div className="va-container va-footer-grid">
          <div><Wordmark light /><p>Um espaço inteiro para celebrar histórias que ficam para sempre.</p></div>
          <div><strong>Navegue</strong><a href="#espaco">O espaço</a><a href="#ambientes">Ambientes</a><a href="#pacotes">Pacotes</a><a href="#disponibilidade">Disponibilidade</a></div>
          <div><strong>Equipe</strong><Link href="/dashboard">Painel administrativo</Link><a href={`mailto:${contactEmail}`}>{contactEmail}</a><span>Atendimento com hora marcada</span></div>
        </div>
        <div className="va-container va-footer-bottom"><p>Demonstração funcional desenvolvida pela LPeM Software. Villa Aurora é uma marca fictícia; dados, valores e imagens são ilustrativos.</p><span>© 2026 LPeM Software</span></div>
      </footer>
    </main>
  )
}
