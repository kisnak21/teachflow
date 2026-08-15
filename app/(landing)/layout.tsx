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
  metadataBase: new URL('https://teachflow.id'),
  title: 'TeachFlow — Asisten Administrasi untuk Guru',
  description:
    'Kelola kelas, absensi, dan nilai dalam satu tempat. RPP Generator AI, rekap otomatis, ekspor PDF & Excel — gratis selama beta.',
  openGraph: {
    title: 'TeachFlow — Asisten Administrasi untuk Guru',
    description:
      'Kelola kelas, absensi, dan nilai dalam satu tempat. RPP Generator AI, rekap otomatis, ekspor PDF & Excel — gratis selama beta.',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary',
    title: 'TeachFlow — Asisten Administrasi untuk Guru',
    description:
      'Kelola kelas, absensi, dan nilai dalam satu tempat. RPP Generator AI, rekap otomatis — gratis selama beta.',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn(fredoka.variable, caveat.variable)}>
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('js')",
        }}
      />
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>
      {children}
    </div>
  )
}
