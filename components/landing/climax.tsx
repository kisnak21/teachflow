import { Sparkle, Squiggle } from './doodles'
import { AuthCta } from './auth-cta'

export function Climax({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <section className="climax">
      <div className="container">
        <Sparkle
          width={28}
          height={28}
          style={{ top: 36, left: '10%', color: 'var(--secondary)' }}
        />
        <Sparkle width={20} height={20} style={{ top: 60, right: '12%' }} />
        <h2 className="font-display">
          Malam minggumu{' '}
          <span className="squiggle-wrap">
            punya rencana lain
            <Squiggle />
          </span>{' '}
          sekarang
        </h2>
        <p>
          Kurangi 3 jam administrasi per minggu. Kembalikan itu untuk mengajar,
          keluarga, atau sekadar istirahat.
        </p>
        <div className="climax-cta">
          <AuthCta
            size="lg"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Mulai Gratis Hari Ini"
          />
          <a className="btn btn-outline btn-lg" href="#solusi">
            Lihat Fitur
          </a>
        </div>
        <div className="climax-note">
          Tanpa kartu kredit · Siap dipakai dalam 5 menit · Bisa dibatalkan
          kapan saja
        </div>
      </div>
    </section>
  )
}
