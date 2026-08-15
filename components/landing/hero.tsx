import { Sparkle } from './doodles'
import { Reveal } from './reveal'
import { AuthCta } from './auth-cta'
import { landingButtonVariants } from './landing-button'

export function Hero({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <header className="hero relative flex min-h-[92vh] items-center overflow-hidden px-6 pb-[110px] pt-[170px] max-[640px]:pb-20 max-[640px]:pt-[140px]">
      <div className="mx-auto w-full max-w-[1080px]">
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

        <h1 className="font-display max-w-[800px] text-balance text-[clamp(2.1rem,5vw,3.3rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
          Masih menghabiskan malam minggu{' '}
          <span className="font-medium text-muted-foreground">
            menghitung absensi
          </span>{' '}
          dan{' '}
          <span className="font-medium text-muted-foreground">
            merapikan nilai
          </span>{' '}
          di kertas?
        </h1>
        <p className="mb-[34px] mt-[22px] max-w-[560px] text-[1.08rem] text-muted-foreground">
          Kalau iya, kamu tahu rasanya: jam 22.00, setumpuk kertas rekap, dan
          kalkulator yang tak kunjung akur. TeachFlow hadir untuk mengubah itu
          semua.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <AuthCta
            size="lg"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Daftar Gratis"
          />
          <a
            className={landingButtonVariants({
              variant: 'outline',
              size: 'lg',
            })}
            href="#solusi"
          >
            Langsung ke solusinya
          </a>
          <span className="font-hand -rotate-2 text-[1.2rem] text-secondary">
            tenang, nggak bikin nagih kok
          </span>
        </div>
        <Reveal>
          <div className="relative mt-[52px] flex flex-wrap gap-[44px] border-t border-dashed border-landing-line pt-[26px]">
            <div>
              <b className="font-display block text-[1.5rem] font-semibold text-primary">
                3+ jam
              </b>
              <span className="text-[0.82rem] font-medium text-muted-foreground">
                hemat per minggu
              </span>
            </div>
            <div>
              <b className="font-display block text-[1.5rem] font-semibold text-secondary">
                5 menit
              </b>
              <span className="text-[0.82rem] font-medium text-muted-foreground">
                untuk mulai
              </span>
            </div>
            <div>
              <b className="font-display block text-[1.5rem] font-semibold text-primary">
                100%
              </b>
              <span className="text-[0.82rem] font-medium text-muted-foreground">
                gratis selama beta
              </span>
            </div>
            <span className="font-hand absolute right-0 top-[-14px] inline-flex rotate-6 items-center gap-2 rounded-[10px] border-2 border-current px-4 py-[3px] text-[1.05rem] font-bold uppercase leading-[1.4] tracking-[0.09em] opacity-90 outline-2 outline-offset-2 outline-current max-[640px]:hidden">
              gratis!
            </span>
          </div>
        </Reveal>
      </div>
    </header>
  )
}
