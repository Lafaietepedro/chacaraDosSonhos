type SimplePdfOptions = {
  title: string
  subtitle?: string
  lines: string[]
}

const pageWidth = 595
const pageHeight = 842
const pageMargin = 48
const maxTextLength = 92
const maxLinesPerPage = 42

function leftPad(value: number, length: number) {
  let text = String(value)
  while (text.length < length) text = `0${text}`
  return text
}

function normalizePdfText(value: string) {
  return value
    .replace(/\r/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[•]/g, '-')
    .split('')
    .map((char) => char.charCodeAt(0) <= 255 ? char : '?')
    .join('')
}

function escapePdfText(value: string) {
  return normalizePdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function wrapLine(line: string) {
  if (line.length <= maxTextLength) return [line]

  const words = line.split(' ')
  const wrapped: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxTextLength && current) {
      wrapped.push(current)
      current = word
    } else {
      current = candidate
    }
  }

  if (current) wrapped.push(current)
  return wrapped
}

function prepareLines(lines: string[]) {
  return lines.flatMap((line) => {
    const trimmed = line.trim()
    if (!trimmed) return ['']
    return wrapLine(trimmed)
  })
}

function chunkLines(lines: string[]) {
  const pages: string[][] = []
  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage))
  }
  return pages.length > 0 ? pages : [[]]
}

function createContentStream(params: {
  title: string
  subtitle?: string
  lines: string[]
  page: number
  pageCount: number
}) {
  const commands: string[] = [
    'BT',
    '/F1 18 Tf',
    `${pageMargin} ${pageHeight - pageMargin} Td`,
    `(${escapePdfText(params.title)}) Tj`,
  ]

  if (params.subtitle) {
    commands.push('/F1 10 Tf', '0 -18 Td', `(${escapePdfText(params.subtitle)}) Tj`)
  }

  commands.push('/F1 10 Tf', `0 ${params.subtitle ? -24 : -28} Td`)

  params.lines.forEach((line, index) => {
    if (index > 0) commands.push('0 -15 Td')
    commands.push(`(${escapePdfText(line)}) Tj`)
  })

  commands.push(
    'ET',
    'BT',
    '/F1 8 Tf',
    `${pageMargin} 34 Td`,
    `(Venue Eventos - pagina ${params.page} de ${params.pageCount}) Tj`,
    'ET'
  )

  return commands.join('\n')
}

export function createSimplePdf({ title, subtitle, lines }: SimplePdfOptions) {
  const preparedLines = prepareLines(lines)
  const pages = chunkLines(preparedLines)
  const objects: string[] = []
  const pageObjectIds = pages.map((_, index) => 4 + index * 2)

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  pages.forEach((pageLines, index) => {
    const pageObjectId = pageObjectIds[index]
    const contentObjectId = pageObjectId + 1
    const content = createContentStream({
      title,
      subtitle,
      lines: pageLines,
      page: index + 1,
      pageCount: pages.length,
    })

    objects[pageObjectId] = [
      '<< /Type /Page',
      '/Parent 2 0 R',
      `/MediaBox [0 0 ${pageWidth} ${pageHeight}]`,
      '/Resources << /Font << /F1 3 0 R >> >>',
      `/Contents ${contentObjectId} 0 R`,
      '>>',
    ].join(' ')
    objects[contentObjectId] = `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`
  })

  let output = '%PDF-1.4\n'
  const offsets = [0]

  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) continue
    offsets[id] = Buffer.byteLength(output, 'latin1')
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }

  const xrefOffset = Buffer.byteLength(output, 'latin1')
  output += `xref\n0 ${objects.length}\n`
  output += '0000000000 65535 f \n'

  for (let id = 1; id < objects.length; id += 1) {
    output += `${leftPad(offsets[id] ?? 0, 10)} 00000 n \n`
  }

  output += [
    'trailer',
    `<< /Size ${objects.length} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n')

  return Buffer.from(output, 'latin1')
}
