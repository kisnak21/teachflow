import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { Sparkle } from './doodles'
import { Reveal } from './reveal'

export function Hero({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <header className="hero">
      <div className="container">
        <Sparkle
          width={30}
          height={30}
          style={{ top: 110, left: '6%', color: 'var(--secondary)' }}
        />
        <Sparkle
          width={22}
          height={22}
          style={{ top: 190, right: '8%', opacity: 0.7 }}
        />
        <Sparkle
          width={26}
          height={26}
          style={{
            top: 260,
            left: '14%',
            color: 'var(--secondary)',
            opacity: 0.6,
          }}
        />

        <h1 className="font-display">
          Masih menghabiskan malam minggu{' '}
          <span className="dim">menghitung absensi</span> dan{' '}
          <span className="dim">merapikan nilai</span> di kertas?
        </h1>
        <p>
          Kalau iya, kamu tahu rasanya: jam 22.00, setumpuk kertas rekap, dan
          kalkulator yang tak kunjung akur. TeachFlow hadir untuk mengubah itu
          semua.
        </p>
        <div className="hero-cta">
          {isAuthenticated ? (
            <Link className="btn btn-primary btn-lg" href={dashboardHref}>
              <LayoutDashboard className="h-5 w-5" />
              Buka Dashboard
            </Link>
          ) : (
            <Link className="btn btn-primary btn-lg" href="/register">
              Daftar Gratis
            </Link>
          )}
          <a className="btn btn-outline btn-lg" href="#solusi">
            Langsung ke solusinya
          </a>
          <span className="hand font-hand">tenang, nggak bikin nagih kok</span>
        </div>
        <Reveal>
          <div className="hero-stats">
            <div>
              <b className="amber">3+ jam</b>
              <span>hemat per minggu</span>
            </div>
            <div>
              <b className="teal">5 menit</b>
              <span>untuk mulai</span>
            </div>
            <div>
              <b className="amber">100%</b>
              <span>gratis selama beta</span>
            </div>
            <span className="stamp stamp-note">gratis!</span>
          </div>
        </Reveal>
      </div>
    </header>
  )
}
