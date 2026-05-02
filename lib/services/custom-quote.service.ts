import { parseCustomBookingNotes } from '../custom-briefing'

type QuoteAddonInput = {
  name: string
  price: number
  quantity: number
}

export type CustomQuoteDraft = {
  eventType: string | null
  desiredDuration: string | null
  budgetRange: string | null
  requirements: string | null
  estimatedAmount: number
  items: Array<{
    label: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
    source: string
  }>
}

function getBriefingField(fields: Array<{ label: string; value: string }>, label: string) {
  return fields.find((field) => field.label === label)?.value ?? null
}

export function buildCustomQuoteDraft(params: {
  notes: string | null | undefined
  packageName: string
  basePrice: number
  operationalFee: number
  extraGuests: number
  extraGuestFee: number
  addons: QuoteAddonInput[]
}): CustomQuoteDraft | null {
  const briefing = parseCustomBookingNotes(params.notes)

  if (!briefing.isCustom) return null

  const items: CustomQuoteDraft['items'] = [
    {
      label: `Pacote base: ${params.packageName}`,
      quantity: 1,
      unit: 'fixed',
      unitPrice: params.basePrice,
      total: params.basePrice,
      source: 'base_package',
    },
    {
      label: 'Taxa operacional',
      quantity: 1,
      unit: 'fixed',
      unitPrice: params.operationalFee,
      total: params.operationalFee,
      source: 'operational_fee',
    },
  ]

  if (params.extraGuests > 0) {
    items.push({
      label: 'Convidados extras',
      quantity: params.extraGuests,
      unit: 'guest',
      unitPrice: params.extraGuestFee,
      total: params.extraGuests * params.extraGuestFee,
      source: 'extra_guests',
    })
  }

  for (const addon of params.addons) {
    items.push({
      label: addon.name,
      quantity: addon.quantity,
      unit: 'item',
      unitPrice: addon.price,
      total: addon.price * addon.quantity,
      source: 'addon',
    })
  }

  const estimatedAmount = items.reduce((sum, item) => sum + item.total, 0)

  return {
    eventType: getBriefingField(briefing.fields, 'Tipo de evento'),
    desiredDuration: getBriefingField(briefing.fields, 'Duração desejada'),
    budgetRange: getBriefingField(briefing.fields, 'Faixa de investimento'),
    requirements: getBriefingField(briefing.fields, 'Necessidades principais'),
    estimatedAmount,
    items,
  }
}
