import { z } from 'zod'
import { MARKERS } from './prompt'

export const generatedLessonPlanSchema = z.object({
  title: z.string().min(1),
  objectives: z.array(z.string().min(1)).min(1),
  activities: z.array(z.string().min(1)).min(1),
  assessment: z.array(z.string().min(1)).min(1),
  homework: z.array(z.string().min(1)).min(1),
  materials: z.array(z.string().min(1)).min(1),
  methods: z.array(z.string().min(1)).min(1),
  differentiation: z.array(z.string().min(1)).min(1),
})

export type GeneratedLessonPlan = z.infer<typeof generatedLessonPlanSchema>

function stripBullet(line: string): string {
  return line.replace(/^\s*[-•\d.)\s]+/, '').trim()
}

function splitSectionBody(raw: string): string[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  // TITLE handled separately
  const items: string[] = []
  for (const line of lines) {
    const cleaned = stripBullet(line)
    if (cleaned) items.push(cleaned)
  }
  return items
}

export function parseStreamedSections(text: string): GeneratedLessonPlan {
  // Find marker positions — marker must be at start of line (no leading \s* to keep index accurate)
  const markerRegex = new RegExp(
    `^(${MARKERS.map((m) => m.replace(/[[\]]/g, '\\$&')).join('|')})\\s*$`,
    'gm'
  )

  const positions: { marker: string; index: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = markerRegex.exec(text)) !== null) {
    const end = m.index + m[0].length
    // Skip the newline that terminates this marker line
    let bodyStart = end
    if (text[bodyStart] === '\r') bodyStart++
    if (text[bodyStart] === '\n') bodyStart++
    positions.push({ marker: m[1], index: m.index, end: bodyStart })
  }

  if (positions.length === 0) {
    throw new Error('No section markers found in AI output')
  }

  const sections = new Map<string, string>()
  for (let i = 0; i < positions.length; i++) {
    const cur = positions[i]
    const next = positions[i + 1]
    const start = cur.end
    const end = next ? next.index : text.length
    const body = text.slice(start, end).trim()
    // Keep last occurrence if duplicate markers
    sections.set(cur.marker, body)
  }

  const titleRaw =
    (sections.get('[TITLE]') ?? '').trim().split('\n')[0]?.trim() ?? ''
  const title = stripBullet(titleRaw) || titleRaw
  if (!title) throw new Error('Missing [TITLE]')

  function getList(marker: string): string[] {
    const raw = sections.get(marker) ?? ''
    const items = splitSectionBody(raw)
    if (items.length === 0) throw new Error(`Missing or empty ${marker}`)
    return items
  }

  const parsed = {
    title,
    objectives: getList('[OBJECTIVES]'),
    activities: getList('[ACTIVITIES]'),
    assessment: getList('[ASSESSMENT]'),
    homework: getList('[HOMEWORK]'),
    materials: getList('[MATERIALS]'),
    methods: getList('[METHODS]'),
    differentiation: getList('[DIFFERENTIATION]'),
  }

  const result = generatedLessonPlanSchema.safeParse(parsed)
  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }
  return result.data
}

// For incremental SSE: split buffer into completed sections and current partial
export function splitBufferForSSE(buffer: string): {
  completed: { marker: string; text: string }[]
  partialMarker: string | null
  partialText: string
} {
  const markerRegex = new RegExp(
    `^(${MARKERS.map((m) => m.replace(/[[\]]/g, '\\$&')).join('|')})\\s*$`,
    'gm'
  )
  const positions: { marker: string; index: number; end: number }[] = []
  let m: RegExpExecArray | null
  while ((m = markerRegex.exec(buffer)) !== null) {
    let end = m.index + m[0].length
    if (buffer[end] === '\r') end++
    if (buffer[end] === '\n') end++
    positions.push({
      marker: m[1],
      index: m.index,
      end,
    })
  }

  if (positions.length === 0) {
    return { completed: [], partialMarker: null, partialText: buffer }
  }

  const completed: { marker: string; text: string }[] = []
  for (let i = 0; i < positions.length - 1; i++) {
    const cur = positions[i]
    const next = positions[i + 1]
    const body = buffer.slice(cur.end, next.index).trim()
    completed.push({ marker: cur.marker, text: body })
  }

  const last = positions[positions.length - 1]
  const partialText = buffer.slice(last.end).trim()

  return { completed, partialMarker: last.marker, partialText }
}
