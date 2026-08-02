import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey && process.env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY is not set. Add it to .env or environment variables.')
}

export const resend = apiKey ? new Resend(apiKey) : null
