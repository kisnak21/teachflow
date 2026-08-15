export const AI_CONFIG = {
  groqModel: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
  groqMaxTokens: Number(process.env.GROQ_MAX_TOKENS ?? 2400),

  dashscopeBaseUrl:
    process.env.DASHSCOPE_BASE_URL ??
    'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  dashscopeModelQwen: process.env.DASHSCOPE_MODEL_QWEN ?? 'qwen3.7-max',
  dashscopeModelDeepseek:
    process.env.DASHSCOPE_MODEL_DEEPSEEK ?? 'deepseek-v4-flash-0731',
  dashscopeMaxTokens: Number(process.env.DASHSCOPE_MAX_TOKENS ?? 2400),
} as const
