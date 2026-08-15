import Link from 'next/link'
import { Check, Clock } from 'lucide-react'
import { Reveal } from './reveal'
import { AuthCta } from './auth-cta'
import { SectionHeading } from './section-heading'
import { landingButtonVariants } from './landing-button'

const NOW_FEATURES = [
  'Semua fitur: RPP AI, absensi, nilai, analitik',
  '5 kelas & 250 siswa',
  'Ekspor PDF & Excel tanpa batas',
]

const SOON_FEATURES = [
  'Kelas & siswa tanpa batas',
  'Portal orang tua & laporan otomatis',
  'Prioritas dukungan 1-on-1',
]

export function Pricing({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  return (
    <section
      id="harga"
      className="scroll-mt-[88px] border-t border-dashed border-landing-line bg-background py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading
          label="Seberapa dalam kamu ingin masuk?"
          color="text-secondary"
        />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          Gratis selama beta, premium menyusul
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Saat ini semua fitur terbuka untukmu. Rencana premium sedang
          dikerjakan — kabar pertamanya dijamin ramah guru.
        </p>
        <div className="mt-10 grid max-w-[820px] gap-[22px] md:grid-cols-2">
          <Reveal className="relative rounded-[calc(var(--radius)+4px)] border-2 border-primary bg-card p-[26px]">
            <span className="font-hand absolute right-[-10px] top-[22px] inline-flex rotate-8 items-center gap-2 rounded-[10px] border-2 border-current px-4 py-[3px] text-[1.05rem] font-bold uppercase leading-[1.4] tracking-[0.09em] opacity-90 outline-2 outline-offset-2 outline-current">
              gratis!
            </span>
            <h3 className="font-display mb-1.5 text-[1.08rem] font-semibold">
              Guru — Beta
            </h3>
            <div className="font-display mb-3 text-[1.8rem] font-semibold text-foreground">
              Rp0
              <span className="text-sm font-medium text-muted-foreground">
                /bulan
              </span>
            </div>
            <ul className="mb-[18px] flex flex-col gap-1.5 text-[0.9rem]">
              {NOW_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <AuthCta
              isAuthenticated={isAuthenticated}
              dashboardHref={dashboardHref}
              label="Daftar Gratis"
            />
          </Reveal>
          <Reveal
            delay={1}
            className="relative rounded-[calc(var(--radius)+4px)] border border-dashed border-border bg-card p-[26px]"
          >
            <span className="font-hand mb-2.5 inline-flex -rotate-2 items-center gap-1.5 rounded-full border border-dashed border-border bg-muted px-3.5 py-0.5 text-[1.1rem] font-bold text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-secondary" />
              nanti ya!
            </span>
            <h3 className="font-display mb-1.5 text-[1.08rem] font-semibold">
              Guru — Premium
            </h3>
            <div className="font-display mb-3 text-[1.8rem] font-semibold text-foreground">
              Rp—
            </div>
            <ul className="mb-[18px] flex flex-col gap-1.5 text-[0.9rem]">
              {SOON_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-secondary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              className={landingButtonVariants({ variant: 'outline' })}
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
