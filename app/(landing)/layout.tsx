import type { Metadata } from 'next'
import { Fredoka, Caveat } from 'next/font/google'
import { cn } from '@/lib/utils'
import './landing.css'

const fredoka = Fredoka({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
})

const caveat = Caveat({
  variable: '--font-hand',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'TeachFlow — Asisten Administrasi untuk Guru',
  description:
    'Kelola kelas, absensi, dan nilai dalam satu tempat. RPP Generator AI, rekap otomatis, ekspor PDF & Excel — gratis selama beta.',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={cn(fredoka.variable, caveat.variable)}>{children}</div>
}
