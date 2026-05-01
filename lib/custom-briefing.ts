export type CustomBookingBriefing = {
  isCustom: boolean
  fields: Array<{
    label: string
    value: string
  }>
  remainingNotes: string
}

const CUSTOM_BOOKING_MARKER = '[Pacote sob medida]'

const supportedLabels = new Set([
  'Tipo de evento',
  'Duração desejada',
  'Faixa de investimento',
  'Necessidades principais',
])

export function parseCustomBookingNotes(notes: string | null | undefined): CustomBookingBriefing {
  const trimmedNotes = notes?.trim() ?? ''

  if (!trimmedNotes.includes(CUSTOM_BOOKING_MARKER)) {
    return {
      isCustom: false,
      fields: [],
      remainingNotes: trimmedNotes,
    }
  }

  const fields: CustomBookingBriefing['fields'] = []
  const remainingLines: string[] = []

  for (const rawLine of trimmedNotes.split('\n')) {
    const line = rawLine.trim()
    if (!line || line === CUSTOM_BOOKING_MARKER) continue

    const separatorIndex = line.indexOf(':')
    if (separatorIndex > 0) {
      const label = line.slice(0, separatorIndex).trim()
      const value = line.slice(separatorIndex + 1).trim()

      if (supportedLabels.has(label) && value) {
        fields.push({ label, value })
        continue
      }
    }

    remainingLines.push(line)
  }

  return {
    isCustom: true,
    fields,
    remainingNotes: remainingLines.join('\n'),
  }
}
