import OpenAI from 'openai'
import { AI_CONFIG } from './config'

export type ProviderId = 'openrouter' | 'groq'

export interface AIModelOption {
  id: string
  label: string
  provider: ProviderId
}

let openrouterClient: OpenAI | null = null

function getOpenRouterClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')
  if (!openrouterClient) {
    openrouterClient = new OpenAI({
      apiKey,
      baseURL: AI_CONFIG.openrouterBaseUrl,
      defaultHeaders: {
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL ?? 'https://teachflow.local',
        'X-Title': 'TeachFlow',
      },
    })
  }
  return openrouterClient
}

// Prefer OpenRouter when configured; legacy groq hanya jika OPENROUTER tidak ada
export function getEnabledModels(): AIModelOption[] {
  // OpenRouter free models — prioritas utama
  if (process.env.OPENROUTER_API_KEY) {
    // Urutan prioritas: yang paling andal untuk marker RPP dulu
    const models: AIModelOption[] = [
      {
        id: AI_CONFIG.openrouterModelGemma,
        label: `OpenRouter · ${AI_CONFIG.openrouterModelGemma}`,
        provider: 'openrouter',
      },
      {
        id: AI_CONFIG.openrouterModelGptOss,
        label: `OpenRouter · ${AI_CONFIG.openrouterModelGptOss}`,
        provider: 'openrouter',
      },
      {
        id: AI_CONFIG.openrouterModelDots,
        label: `OpenRouter · ${AI_CONFIG.openrouterModelDots}`,
        provider: 'openrouter',
      },
      {
        id: AI_CONFIG.openrouterModelNemotron,
        label: `OpenRouter · ${AI_CONFIG.openrouterModelNemotron}`,
        provider: 'openrouter',
      },
    ]
    // Deduplicate jika env sama
    const seen = new Set<string>()
    return models.filter((m) => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    })
  }

  // Legacy fallback — groq hanya jika openrouter tidak dikonfigurasi
  const legacy: AIModelOption[] = []
  if (process.env.GROQ_API_KEY) {
    legacy.push({
      id: AI_CONFIG.groqModel,
      label: `Groq · ${AI_CONFIG.groqModel}`,
      provider: 'groq',
    })
  }
  return legacy
}

export function isModelEnabled(modelId: string): boolean {
  return getEnabledModels().some((m) => m.id === modelId)
}

export function getProviderForModel(modelId: string): ProviderId {
  const found = getEnabledModels().find((m) => m.id === modelId)
  if (found) return found.provider
  // Heuristic fallback
  if (process.env.OPENROUTER_API_KEY) return 'openrouter'
  return 'groq'
}

export async function* streamForModel(
  modelId: string,
  messages: { role: 'user' | 'system'; content: string }[],
  maxTokens: number
): AsyncGenerator<string> {
  const provider = getProviderForModel(modelId)

  if (provider === 'openrouter') {
    const client = getOpenRouterClient()
    const stream = await client.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
    } as unknown as Parameters<OpenAI['chat']['completions']['create']>[0] & {
      stream: true
    })

    for await (const chunk of stream) {
      const c = chunk as unknown as {
        choices: {
          delta?: {
            content?: string | null
            reasoning?: string | null
            reasoning_content?: string | null
          }
        }[]
      }
      const delta = c.choices?.[0]?.delta
      // OpenRouter reasoning models kirim reasoning terpisah — abaikan, hanya content
      const text = delta?.content ?? ''
      if (text) yield text
    }
    return
  }

  // Legacy groq — dipertahankan untuk kompatibilitas
  const { getGroq } = await import('@/lib/groq')
  const groq = getGroq()
  const stream = await groq.chat.completions.create({
    model: modelId,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    stream: true,
  } as unknown as Parameters<
    ReturnType<typeof getGroq>['chat']['completions']['create']
  >[0] & { stream: true })

  for await (const chunk of stream) {
    const delta =
      (chunk as unknown as { choices: { delta?: { content?: string } }[] })
        .choices?.[0]?.delta?.content ?? ''
    if (delta) yield delta
  }
}

// Round-robin cursor (in-memory per instance)
let rrCursor = 0

export function pickRoundRobinModel(): AIModelOption | null {
  const enabled = getEnabledModels()
  if (enabled.length === 0) return null
  const picked = enabled[rrCursor % enabled.length]
  rrCursor = (rrCursor + 1) % Number.MAX_SAFE_INTEGER
  return picked
}

export function orderedCandidates(
  preferredId: string | null,
  strategy: 'manual' | 'round-robin'
): AIModelOption[] {
  const enabled = getEnabledModels()
  if (enabled.length === 0) return []

  if (strategy === 'round-robin' || !preferredId) {
    const start = pickRoundRobinModel()
    if (!start) return enabled
    const idx = enabled.findIndex((m) => m.id === start.id)
    if (idx <= 0) return enabled
    return [...enabled.slice(idx), ...enabled.slice(0, idx)]
  }

  const preferred = enabled.find((m) => m.id === preferredId)
  if (!preferred) return enabled
  return [preferred, ...enabled.filter((m) => m.id !== preferredId)]
}
