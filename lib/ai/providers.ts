import Groq from 'groq-sdk'
import OpenAI from 'openai'
import { AI_CONFIG } from './config'

export type ProviderId = 'groq' | 'dashscope'

export interface AIModelOption {
  id: string
  label: string
  provider: ProviderId
}

let groqClient: Groq | null = null
let dashscopeClient: OpenAI | null = null

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')
  if (!groqClient) groqClient = new Groq({ apiKey })
  return groqClient
}

function getDashscopeClient(): OpenAI {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY is not set')
  if (!dashscopeClient) {
    dashscopeClient = new OpenAI({
      apiKey,
      baseURL: AI_CONFIG.dashscopeBaseUrl,
    })
  }
  return dashscopeClient
}

export function getEnabledModels(): AIModelOption[] {
  const models: AIModelOption[] = []
  if (process.env.GROQ_API_KEY) {
    models.push({
      id: AI_CONFIG.groqModel,
      label: `Groq · ${AI_CONFIG.groqModel}`,
      provider: 'groq',
    })
  }
  if (process.env.DASHSCOPE_API_KEY) {
    models.push({
      id: AI_CONFIG.dashscopeModelQwen,
      label: `DashScope · ${AI_CONFIG.dashscopeModelQwen}`,
      provider: 'dashscope',
    })
    // Avoid duplicate if both env point to same id
    if (AI_CONFIG.dashscopeModelDeepseek !== AI_CONFIG.dashscopeModelQwen) {
      models.push({
        id: AI_CONFIG.dashscopeModelDeepseek,
        label: `DashScope · ${AI_CONFIG.dashscopeModelDeepseek}`,
        provider: 'dashscope',
      })
    }
  }
  return models
}

export function isModelEnabled(modelId: string): boolean {
  return getEnabledModels().some((m) => m.id === modelId)
}

export function getProviderForModel(modelId: string): ProviderId {
  const found = getEnabledModels().find((m) => m.id === modelId)
  if (found) return found.provider
  // Heuristic fallback when model not in enabled list but caller forces it
  if (modelId === AI_CONFIG.groqModel) return 'groq'
  return 'dashscope'
}

export interface StreamChunk {
  text: string
  done: boolean
}

export async function* streamForModel(
  modelId: string,
  messages: { role: 'user' | 'system'; content: string }[],
  maxTokens: number
): AsyncGenerator<string> {
  const provider = getProviderForModel(modelId)

  if (provider === 'groq') {
    const groq = getGroqClient()
    // groq-sdk streaming
    const stream = await groq.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
    } as unknown as Parameters<Groq['chat']['completions']['create']>[0] & {
      stream: true
    })

    for await (const chunk of stream) {
      const delta =
        (chunk as unknown as { choices: { delta?: { content?: string } }[] })
          .choices?.[0]?.delta?.content ?? ''
      if (delta) yield delta
    }
  } else {
    const client = getDashscopeClient()
    // DashScope via OpenAI-compatible — disable thinking for structured output
    const stream = await client.chat.completions.create({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      stream: true,
      // DashScope-specific: silence reasoning_content
      extra_body: { enable_thinking: false },
    } as unknown as Parameters<OpenAI['chat']['completions']['create']>[0] & {
      stream: true
    })

    for await (const chunk of stream) {
      // Only delta.content — skip reasoning_content
      const delta =
        (
          chunk as unknown as {
            choices: { delta?: { content?: string | null } }[]
          }
        ).choices?.[0]?.delta?.content ?? ''
      if (delta) yield delta
    }
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
    // Rotate so that next RR pick is first
    const start = pickRoundRobinModel()
    if (!start) return enabled
    const idx = enabled.findIndex((m) => m.id === start.id)
    if (idx <= 0) return enabled
    return [...enabled.slice(idx), ...enabled.slice(0, idx)]
  }

  // manual: preferred first, then the rest
  const preferred = enabled.find((m) => m.id === preferredId)
  if (!preferred) return enabled
  return [preferred, ...enabled.filter((m) => m.id !== preferredId)]
}
