'use server'

import { requireTeacher } from '@/lib/auth-helpers'
import { aiRateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import { buildLessonPrompt } from '@/lib/ai/prompt'
import { parseStreamedSections, type GeneratedLessonPlan } from '@/lib/ai/parse'
import {
  getEnabledModels,
  pickRoundRobinModel,
  streamForModel,
} from '@/lib/ai/providers'
import { AI_CONFIG } from '@/lib/ai/config'

// Kept for backwards compatibility (non-streaming). Prefer POST /api/ai/generate for streaming.
const generateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  grade: z.string().min(1, 'Grade is required'),
  duration: z.string().min(1, 'Duration is required'),
})

export type GenerateInput = z.infer<typeof generateSchema>
export type { GeneratedLessonPlan }

export async function generateLessonPlan(
  data: GenerateInput
): Promise<GeneratedLessonPlan> {
  const teacherId = await requireTeacher()
  aiRateLimit.check(teacherId)

  const parsed = generateSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const enabled = getEnabledModels()
  if (enabled.length === 0) throw new Error('No AI provider configured')

  const candidate = pickRoundRobinModel() ?? enabled[0]
  const prompt = buildLessonPrompt({
    subject: parsed.data.subject,
    topic: parsed.data.topic,
    grade: parsed.data.grade,
    duration: parsed.data.duration,
    curriculum: 'umum',
    language: 'id',
  })

  const maxTokens =
    candidate.provider === 'groq'
      ? AI_CONFIG.groqMaxTokens
      : AI_CONFIG.dashscopeMaxTokens

  let buffer = ''
  for await (const delta of streamForModel(
    candidate.id,
    [{ role: 'user', content: prompt }],
    maxTokens
  )) {
    buffer += delta
  }

  if (!buffer.trim()) throw new Error('No response from AI')
  return parseStreamedSections(buffer)
}
