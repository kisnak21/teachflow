import { Sparkle, Squiggle } from './doodles'
import { AuthCta } from './auth-cta'
import { landingButtonVariants } from './landing-button'

export function Climax({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <section className="climax relative scroll-mt-[88px] overflow-hidden py-[110px] text-center">
      <div className="mx-auto max-w-[1080px] px-6">
        <Sparkle
          width={28}
          height={28}
          style={{ top: 36, left: '10%', color: 'var(--secondary)' }}
        />
        <Sparkle width={20} height={20} style={{ top: 60, right: '12%' }} />
        <h2 className="font-display mb-[18px] text-balance text-[clamp(1.9rem,4.5vw,2.8rem)] font-semibold tracking-[-0.02em]">
          Malam minggumu{' '}
          <span className="relative inline-block whitespace-nowrap text-primary">
            punya rencana lain
            <Squiggle className="absolute bottom-[-0.18em] left-0 right-0 h-[0.22em] w-full" />
          </span>{' '}
          sekarang
        </h2>
        <p className="mx-auto mb-[34px] max-w-[540px] text-[1.05rem] text-muted-foreground">
          Kurangi 3 jam administrasi per minggu. Kembalikan itu untuk mengajar,
          keluarga, atau sekadar istirahat.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AuthCta
            size="lg"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Mulai Gratis Hari Ini"
          />
          <a
            className={landingButtonVariants({
              variant: 'outline',
              size: 'lg',
            })}
            href="#solusi"
          >
            Lihat Fitur
          </a>
        </div>
        <div className="mt-[18px] text-[0.85rem] font-medium text-muted-foreground">
          Tanpa kartu kredit · Siap dipakai dalam 5 menit · Bisa dibatalkan
          kapan saja
        </div>
      </div>
    </section>
  )
}
