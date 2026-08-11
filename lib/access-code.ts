import { randomInt } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateAccessCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]
  }
  return code
}
