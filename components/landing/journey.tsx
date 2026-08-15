import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const STEPS = [
  {
    num: '1',
    title: 'Absensi jadi sekali klik',
    note: '(ini yang paling disuka!)',
    body: 'Daftar siswa langsung tampil, centang yang hadir, sisanya otomatis jadi data — rekap bulanan ikut tersusun sendiri.',
  },
  {
    num: '2',
    title: 'RPP cukup tulis topiknya',
    note: '(AI-nya rajin banget)',
    body: 'AI yang menyusun draf lengkap: tujuan pembelajaran, aktivitas, dan asesmen. Kamu tinggal menyempurnakan.',
  },
  {
    num: '3',
    title: 'Nilai tersusun, rapor siap',
    note: '(bye bye, error Excel!)',
    body: 'Semua nilai masuk ke satu tempat. Rata-rata, rekap, dan laporan tersusun otomatis — tinggal unduh.',
  },
]

export function Journey() {
  return (
    <section
      id="perjalanan"
      className="scroll-mt-[88px] bg-background py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading label="Bab 2 · Perjalanannya" color="text-secondary" />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          Kami mulai dari pertanyaan sederhana
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Bagaimana kalau semua administrasi itu bisa selesai dalam hitungan
          klik — sambil guru tetap fokus di depan kelas?
        </p>
        <div className="mt-11 flex max-w-[760px] flex-col gap-[18px]">
          {STEPS.map((step, i) => (
            <Reveal
              key={step.num}
              delay={i}
              className="flex items-start gap-5 rounded-[calc(var(--radius)+2px)] border border-border bg-card p-5"
            >
              <span className="font-display grid h-[42px] w-[42px] shrink-0 -rotate-6 place-items-center rounded-full bg-secondary text-[1.05rem] font-semibold text-secondary-foreground">
                {step.num}
              </span>
              <div>
                <h3 className="font-display mb-1 text-[1.05rem] font-semibold">
                  {step.title}
                  <span className="font-hand ml-2 inline-block -rotate-1 text-base text-primary">
                    {step.note}
                  </span>
                </h3>
                <p className="text-[0.92rem] text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
