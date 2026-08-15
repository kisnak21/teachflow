import { Sparkles } from 'lucide-react'
import { Reveal } from './reveal'
import { Tape } from './doodles'
import { SectionHeading } from './section-heading'

const OUTPUTS = [
  'Tujuan pembelajaran & indikator ketercapaian',
  'Aktivitas: pendahuluan, inti, penutup (sesuai 2 JP)',
  'Asesmen formatif + kunci jawaban singkat',
  'Dapat diedit, disimpan, dan diekspor PDF',
]

export function AiShowcase() {
  return (
    <section
      id="ai"
      className="scroll-mt-[88px] border-t border-dashed border-landing-line bg-card py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading label="Bab 4 · Sentuhan AI" />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          RPP yang biasanya 2 jam, sekarang 20 detik
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Tulis topiknya, AI menyusun kerangkanya. Kamu yang memegang kendali —
          AI hanya mempercepat.
        </p>
        <Reveal className="relative mt-[46px] max-w-[720px] rounded-[calc(var(--radius)+6px)] border border-dashed border-primary bg-background p-[30px]">
          <Tape
            className="left-8 top-[-12px] -rotate-3"
            color="var(--primary)"
          />
          <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-muted px-[18px] py-3.5 text-[0.95rem] text-foreground">
            <Sparkles
              className="h-[18px] w-[18px] shrink-0"
              style={{ color: 'var(--primary)' }}
            />
            <span>
              &quot;Buatkan RPP Matematika kelas 7, materi aljabar, 2 JP&quot;
            </span>
            <span className="font-display ml-auto flex shrink-0 items-center gap-1.5 font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </span>
          </div>
          <div className="mt-4 rounded-[var(--radius)] border border-dashed border-border bg-paper px-[22px] py-5 text-[0.9rem]">
            <div className="font-hand mb-2 text-[1.3rem] font-bold text-primary">
              Draf RPP siap — 20 detik
            </div>
            <ul className="flex flex-col gap-1.5 text-muted-foreground">
              {OUTPUTS.map((o) => (
                <li
                  key={o}
                  className="relative pl-[18px] before:absolute before:left-0 before:top-2 before:h-[7px] before:w-[7px] before:rounded-[2px] before:bg-secondary"
                >
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
