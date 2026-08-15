import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

const QUOTES = [
  {
    text: 'Absensi yang dulu 2 jam tiap bulan, sekarang 5 menit. Rekapnya langsung rapi, tinggal print.',
    name: 'Bu Rina',
    school: 'SDN 3 Cikupa',
    detail: 'Guru kelas 5, 2 bulan pakai',
    tilt: '-rotate-[1.6deg]',
  },
  {
    text: 'RPP yang biasanya saya tulis 2 jam, dibantu AI jadi 20 menit. Saya tinggal edit sedikit-sedikit.',
    name: 'Pak Dedi',
    school: 'SMPN 12 Bandung',
    detail: 'Guru Matematika, 1 bulan pakai',
    tilt: 'rotate-[1.2deg] mt-2',
  },
  {
    text: 'Import Excel-nya jagoan banget. Daftar 240 siswa masuk dalam sekali upload, kolomnya ketemu sendiri.',
    name: 'Bu Sari',
    school: 'SMA PGRI Jogja',
    detail: 'Guru BK, 3 minggu pakai',
    tilt: '-rotate-[0.8deg]',
  },
]

export function Testimonials() {
  return (
    <section
      id="testi"
      className="scroll-mt-[88px] border-t border-dashed border-landing-line bg-background py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading label="Catatan dari guru-guru" color="text-secondary" />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          Kata mereka yang sudah mencoba
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Cerita yang menggambarkan pengalaman guru yang mencoba TeachFlow saat
          beta.
        </p>
        <div className="mx-auto mt-11 grid max-w-[980px] gap-[30px] md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <Reveal
              key={q.name}
              delay={i}
              className={`relative flex min-h-[170px] flex-col justify-between rounded-[3px] bg-postit-bg p-[18px_20px_16px] font-hand text-[1.18rem] leading-[1.35] text-postit-ink shadow-[0_5px_14px_rgba(0,0,0,0.2)] before:absolute before:-top-[9px] before:left-1/2 before:h-5 before:w-[92px] before:-translate-x-1/2 before:-rotate-2 before:rounded-[2px] before:bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.45)_0_7px,rgba(255,255,255,0.2)_7px_14px),var(--postit-tape)] ${q.tilt}`}
            >
              <p>&quot;{q.text}&quot;</p>
              <div className="mt-3 text-[0.95rem] font-semibold">
                {q.name} — {q.school}
                <span className="block text-[0.8rem] font-medium opacity-75">
                  {q.detail}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
