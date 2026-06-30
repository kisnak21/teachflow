import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'teacher' | 'student'
      classId?: string
    } & DefaultSession['user']
  }
}
