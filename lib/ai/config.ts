export const AI_CONFIG = {
  openrouterBaseUrl:
    process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  openrouterModelDots:
    process.env.OPENROUTER_MODEL_DOTS ?? 'dots-studio/dots-3-note-preview:free',
  openrouterModelNemotron:
    process.env.OPENROUTER_MODEL_NEMOTRON ??
    'nvidia/nemotron-3.5-lightning:free',
  openrouterModelGptOss:
    process.env.OPENROUTER_MODEL_GPT_OSS ?? 'openai/gpt-oss-20b:free',
  openrouterModelGemma:
    process.env.OPENROUTER_MODEL_GEMMA ?? 'google/gemma-4-26b-a4b-it:free',
  openrouterMaxTokens: Number(process.env.OPENROUTER_MAX_TOKENS ?? 2400),

  // Legacy Groq — optional fallback jika OPENROUTER tidak dikonfigurasi
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
  groqMaxTokens: Number(process.env.GROQ_MAX_TOKENS ?? 2400),
} as const
