import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { aiRateLimit } from '@/lib/rate-limit'
import { buildLessonPrompt } from '@/lib/ai/prompt'
import { parseStreamedSections } from '@/lib/ai/parse'
import { AI_CONFIG } from '@/lib/ai/config'
import {
  getEnabledModels,
  orderedCandidates,
  streamForModel,
} from '@/lib/ai/providers'

export const runtime = 'nodejs'

const bodySchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  grade: z.string().min(1, 'Grade is required'),
  duration: z.string().min(1, 'Duration is required'),
  curriculum: z.enum(['merdeka', 'k13', 'umum']).optional().default('umum'),
  language: z.enum(['id', 'en']).optional().default('id'),
  method: z.string().max(200).optional(),
  modelId: z.string().optional(),
  strategy: z.enum(['manual', 'round-robin']).optional().default('round-robin'),
  allowFallback: z.boolean().optional().default(true),
})

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function markerLabel(marker: string): string {
  switch (marker) {
    case '[TITLE]':
      return 'Judul'
    case '[OBJECTIVES]':
      return 'Tujuan Pembelajaran'
    case '[ACTIVITIES]':
      return 'Kegiatan'
    case '[ASSESSMENT]':
      return 'Asesmen'
    case '[HOMEWORK]':
      return 'Tugas/PR'
    case '[MATERIALS]':
      return 'Materi & Media'
    case '[METHODS]':
      return 'Metode'
    case '[DIFFERENTIATION]':
      return 'Diferensiasi'
    default:
      return marker
  }
}

export async function POST(req: NextRequest) {
  // Auth — API routes are not covered by proxy
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const role = (session.user as unknown as { role?: string }).role
  // Accept teacher role only for AI generation
  if (role && role !== 'teacher') {
    return new Response(
      JSON.stringify({ error: 'Only teachers can generate' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Rate limit per teacher
  try {
    aiRateLimit.check(session.user.id)
  } catch {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: z.infer<typeof bodySchema>
  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    body = parsed.data
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const enabled = getEnabledModels()
  if (enabled.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          'No AI provider configured. Set GROQ_API_KEY or DASHSCOPE_API_KEY.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Validate explicit modelId when manual
  if (
    body.strategy === 'manual' &&
    body.modelId &&
    !enabled.some((m) => m.id === body.modelId)
  ) {
    return new Response(
      JSON.stringify({ error: `Model ${body.modelId} is not enabled` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const prompt = buildLessonPrompt({
    subject: body.subject,
    topic: body.topic,
    grade: body.grade,
    duration: body.duration,
    curriculum: body.curriculum,
    language: body.language,
    method: body.method,
  })

  const maxTokens =
    body.strategy === 'manual' && body.modelId === AI_CONFIG.groqModel
      ? AI_CONFIG.groqMaxTokens
      : body.strategy === 'manual' && body.modelId
        ? AI_CONFIG.dashscopeMaxTokens
        : Math.max(AI_CONFIG.groqMaxTokens, AI_CONFIG.dashscopeMaxTokens)

  const candidates = orderedCandidates(body.modelId ?? null, body.strategy)

  // Streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)))
      }

      let lastError: string | null = null
      let succeeded = false

      for (const candidate of candidates) {
        try {
          send('meta', {
            model: candidate.id,
            provider: candidate.provider,
            label: candidate.label,
            attempt: candidates.indexOf(candidate) + 1,
          })

          let buffer = ''
          let emittedCount = 0
          let hasFirstToken = false

          // Collect stream for this candidate
          const gen = streamForModel(
            candidate.id,
            [{ role: 'user', content: prompt }],
            maxTokens
          )

          for await (const delta of gen) {
            if (!hasFirstToken) hasFirstToken = true
            buffer += delta

            const markerRegex =
              /^(\[TITLE\]|\[OBJECTIVES\]|\[ACTIVITIES\]|\[ASSESSMENT\]|\[HOMEWORK\]|\[MATERIALS\]|\[METHODS\]|\[DIFFERENTIATION\])\s*$/gm
            const positions: { marker: string; idx: number; end: number }[] = []
            let m: RegExpExecArray | null
            while ((m = markerRegex.exec(buffer)) !== null) {
              let end = m.index + m[0].length
              if (buffer[end] === '\r') end++
              if (buffer[end] === '\n') end++
              positions.push({
                marker: m[1],
                idx: m.index,
                end,
              })
            }

            if (positions.length > 1) {
              const newlyCompleted = positions.length - 1 - emittedCount
              for (let i = 0; i < newlyCompleted; i++) {
                const curIdx = emittedCount + i
                const cur = positions[curIdx]
                const next = positions[curIdx + 1]
                const sectionBody = buffer.slice(cur.end, next.idx).trim()
                send('section', {
                  marker: cur.marker,
                  label: markerLabel(cur.marker),
                  text: sectionBody,
                })
              }
              emittedCount = positions.length - 1
            }

            const lastMarker = positions[positions.length - 1]
            if (lastMarker) {
              const partial = buffer.slice(lastMarker.end)
              send('delta', {
                marker: lastMarker.marker,
                label: markerLabel(lastMarker.marker),
                partial,
                bufferLength: buffer.length,
              })
            }
          }

          if (!hasFirstToken) {
            throw new Error('No tokens received from provider')
          }

          // Parse full buffer
          const parsed = parseStreamedSections(buffer)

          // Emit any remaining sections not yet emitted
          const markerRegex2 =
            /^(\[TITLE\]|\[OBJECTIVES\]|\[ACTIVITIES\]|\[ASSESSMENT\]|\[HOMEWORK\]|\[MATERIALS\]|\[METHODS\]|\[DIFFERENTIATION\])\s*$/gm
          const pos2: { marker: string; end: number; idx: number }[] = []
          let mm: RegExpExecArray | null
          while ((mm = markerRegex2.exec(buffer)) !== null) {
            let end = mm.index + mm[0].length
            if (buffer[end] === '\r') end++
            if (buffer[end] === '\n') end++
            pos2.push({
              marker: mm[1],
              end,
              idx: mm.index,
            })
          }
          for (let i = emittedCount; i < pos2.length; i++) {
            const cur = pos2[i]
            const next = pos2[i + 1]
            const sectionBody = next
              ? buffer.slice(cur.end, next.idx).trim()
              : buffer.slice(cur.end).trim()
            send('section', {
              marker: cur.marker,
              label: markerLabel(cur.marker),
              text: sectionBody,
            })
          }

          send('done', {
            model: candidate.id,
            provider: candidate.provider,
            plan: parsed,
            raw: buffer,
          })
          succeeded = true
          break
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          lastError = message
          // If fallback disabled or last candidate, emit error
          const isLast = candidate === candidates[candidates.length - 1]
          if (!body.allowFallback || isLast) {
            send('error', {
              message,
              model: candidate.id,
              provider: candidate.provider,
            })
            break
          }
          // Otherwise continue to next candidate — notify client of fallback
          send('fallback', {
            from: candidate.id,
            error: message,
            next: candidates[candidates.indexOf(candidate) + 1]?.id ?? null,
          })
          continue
        }
      }

      if (!succeeded && !lastError) {
        send('error', { message: 'No provider available' })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
