"use server"

import { auth } from "@/auth"
import { groq } from "@/lib/groq"
import { z } from "zod"

const generateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  topic: z.string().min(1, "Topic is required"),
  grade: z.string().min(1, "Grade is required"),
  duration: z.string().min(1, "Duration is required"),
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
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = generateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message)
  }

  const { subject, topic, grade, duration } = parsed.data

  const prompt = `You are an experienced teacher creating a lesson plan.

Generate a detailed lesson plan for:
- Subject: ${subject}
- Topic: ${topic}
- Grade: ${grade}
- Duration: ${duration}

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "title": "lesson title here",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "activities": ["activity 1", "activity 2", "activity 3"],
  "assessment": ["assessment idea 1", "assessment idea 2"],
  "homework": ["homework idea 1", "homework idea 2"]
}`

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error("No response from AI")

  try {
    const clean = content.replace(/```json|```/g, "").trim()
    return JSON.parse(clean) as GeneratedLessonPlan
  } catch {
    throw new Error("Failed to parse AI response")
  }
}