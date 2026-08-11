import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { cn } from '@/lib/utils'
import './landing.css'

const fredoka = localFont({
  src: [
    { path: './fonts/fredoka-latin.woff2' },
    { path: './fonts/fredoka-latin-ext.woff2' },
  ],
  weight: '400 700',
  variable: '--font-display',
})

const caveat = localFont({
  src: [
    { path: './fonts/caveat-latin.woff2' },
    { path: './fonts/caveat-latin-ext.woff2' },
  ],
  weight: '400 700',
  variable: '--font-hand',
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
