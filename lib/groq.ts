import Groq from 'groq-sdk'

let client: Groq | null = null

export function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not set. Add it to .env or environment variables.'
    )
  }
  if (!client) client = new Groq({ apiKey })
  return client
}
