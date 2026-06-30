import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: 'teacher',
      name: 'Teacher Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { db } = await import('@/lib/db')
        const bcrypt = await import('bcryptjs')

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'teacher',
        }
      },
    }),
    Credentials({
      id: 'student',
      name: 'Student Login',
      credentials: {
        studentNumber: { label: 'Student Number', type: 'text' },
        accessCode: { label: 'Class Access Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.studentNumber || !credentials?.accessCode) return null

        const { db } = await import('@/lib/db')

        const cls = await db.class.findUnique({
          where: { accessCode: credentials.accessCode as string },
        })

        if (!cls) return null

        const student = await db.student.findFirst({
          where: {
            studentNumber: credentials.studentNumber as string,
            classId: cls.id,
          },
        })

        if (!student) return null

        return {
          id: student.id,
          name: student.name,
          email: null,
          role: 'student',
          classId: cls.id,
        }
      },
    }),
  ],
})
