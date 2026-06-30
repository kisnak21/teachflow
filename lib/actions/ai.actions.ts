'use server'

import { auth } from '@/auth'
import { groq } from '@/lib/groq'
import { z } from 'zod'

const generateSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  grade: z.string().min(1, 'Grade is required'),
  duration: z.string().min(1, 'Duration is required'),
})

export type GenerateInput = z.infer<typeof generateSchema>

export interface GeneratedLessonPlan {
  title: string
  objectives: string[]
  activities: string[]
  assessment: string[]
  homework: string[]
}

export async function generateLessonPlan(
  data: GenerateInput
): Promise<GeneratedLessonPlan> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const parsed = generateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { subject, topic, grade, duration } = parsed.data

  const prompt = `You are an experienced teacher creating a lesson plan specifically calibrated for the grade level given.

Lesson details:
- Subject: ${subject}
- Topic: ${topic}
- Grade/Level: ${grade}
- Duration: ${duration}

CRITICAL — calibrate everything to the grade level "${grade}":
- If this is an early grade (e.g. Primary/Elementary 1-3), use simple vocabulary, short sentences, concrete and hands-on activities, and shorter attention-span pacing. Avoid abstract concepts.
- If this is upper primary (e.g. Primary 4-6), balance concrete and slightly abstract ideas, with guided independent work.
- If this is lower secondary (e.g. Grade 7-9 / SMP / Junior High), include more independent problem-solving and group work.
- If this is upper secondary (e.g. Grade 10-12 / SMA / Senior High / vocational tracks like XI RPL), include analytical tasks, real-world application, and assessment that tests deeper understanding.
- Match terminology, examples, and references (objects, scenarios, language complexity) to what is age-appropriate for "${grade}" students specifically — do not write generic content that ignores the grade.

Generate a detailed, grade-appropriate lesson plan.

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "title": "lesson title here",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "activities": ["activity 1", "activity 2", "activity 3"],
  "assessment": ["assessment idea 1", "assessment idea 2"],
  "homework": ["homework idea 1", "homework idea 2"]
}`

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,

    include_reasoning: false,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('No response from AI')

  try {
    const clean = content.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as GeneratedLessonPlan
  } catch {
    throw new Error('Failed to parse AI response')
  }
}
