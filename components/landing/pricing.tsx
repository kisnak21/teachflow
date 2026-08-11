import Link from 'next/link'
import { Check, Clock, LayoutDashboard } from 'lucide-react'
import { Reveal } from './reveal'

export function Pricing({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <section id="harga" className="chapter pricing">
      <div className="container">
        <span className="ch-label">Seberapa dalam kamu ingin masuk?</span>
        <h2 className="ch-title font-display">
          Gratis selama beta, premium menyusul
        </h2>
        <p className="ch-sub">
          Saat ini semua fitur terbuka untukmu. Rencana premium sedang
          dikerjakan — kabar pertamanya dijamin ramah guru.
        </p>
        <div className="price-row">
          <Reveal className="p-card now">
            <span className="stamp stamp-free">Gratis!</span>
            <h3 className="font-display">Guru — Beta</h3>
            <div className="price">
              Rp0
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--muted-foreground)' }}
              >
                /bulan
              </span>
            </div>
            <ul>
              <li>
                <Check className="h-3.5 w-3.5" />
                Semua fitur: RPP AI, absensi, nilai, analitik
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />5 kelas &amp; 250 siswa
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />
                Ekspor PDF &amp; Excel tanpa batas
              </li>
            </ul>
            {isAuthenticated ? (
              <Link className="btn btn-primary" href={dashboardHref}>
                <LayoutDashboard className="h-4 w-4" />
                Buka Dashboard
              </Link>
            ) : (
              <Link className="btn btn-primary" href="/register">
                Daftar Gratis
              </Link>
            )}
          </Reveal>
          <Reveal delay={1} className="p-card soon">
            <span className="soon-tag">
              <Clock className="h-3.5 w-3.5" />
              nanti ya!
            </span>
            <h3 className="font-display">Guru — Premium</h3>
            <div className="price">Rp—</div>
            <ul>
              <li>
                <Check className="h-3.5 w-3.5" />
                Kelas &amp; siswa tanpa batas
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />
                Portal orang tua &amp; laporan otomatis
              </li>
              <li>
                <Check className="h-3.5 w-3.5" />
                Prioritas dukungan 1-on-1
              </li>
            </ul>
            <Link
              className="btn btn-outline"
              href={isAuthenticated ? dashboardHref : '/register'}
            >
              Beri tahu saya
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
