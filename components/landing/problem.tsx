import { Reveal } from './reveal'
import { Tape } from './doodles'
import { SectionHeading } from './section-heading'

const PAINS = [
  {
    num: '01 / Absensi',
    title: 'Rekap manual yang tak pernah akurat',
    body: 'Menghitung kehadiran dari kertas, satu per satu. Begitu salah hitung, rekap sebulan harus diulang.',
    color: 'var(--primary)',
  },
  {
    num: '02 / RPP',
    title: 'Menulis RPP dari nol, tiap topik',
    body: 'Formatnya panjang, waktunya mepet, dan isinya nyaris sama dari tahun ke tahun.',
    color: 'var(--secondary)',
  },
  {
    num: '03 / Nilai',
    title: 'Excel yang berantakan',
    body: 'Rumus error, file versi ganda, dan laporan yang harus disusun ulang setiap semester.',
    color: 'var(--primary)',
  },
]

export function Problem() {
  return (
    <section
      id="masalah"
      className="scroll-mt-[88px] border-t border-dashed border-landing-line bg-card py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading label="Bab 1 · Masalahnya" color="text-primary" />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          Mengajar itu berat. Administrasinya lebih berat lagi.
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Bukan karena kamu tidak bisa mengajar — tapi karena separuh waktumu
          tersedot pekerjaan yang seharusnya tidak perlu 3 jam.
        </p>
        <div className="mt-11 grid gap-[22px] md:grid-cols-3">
          {PAINS.map((pain, i) => (
            <Reveal
              key={pain.num}
              delay={i}
              className="relative rounded-[calc(var(--radius)+4px)] border border-border bg-background px-6 py-7"
            >
              <Tape
                className="absolute left-1/2 top-[-12px] -translate-x-1/2 -rotate-3 opacity-70"
                color={pain.color}
              />
              <span className="font-hand text-[1.15rem] font-bold tracking-[0.04em] text-secondary">
                {pain.num}
              </span>
              <h3 className="font-display mt-2.5 text-[1.05rem] font-semibold">
                {pain.title}
              </h3>
              <p className="mt-2 text-[0.9rem] text-muted-foreground">
                {pain.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
