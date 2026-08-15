import {
  CalendarCheck,
  FileSpreadsheet,
  ChartColumnBig,
  FilePlus2,
} from 'lucide-react'
import { Reveal } from './reveal'
import { HandArrow, Tape } from './doodles'
import { SectionHeading } from './section-heading'

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Absensi & rekap otomatis',
    body: 'Ekspor PDF atau Excel kapan pun, tanpa menghitung manual lagi.',
  },
  {
    icon: FilePlus2,
    title: 'Rekap nilai menyeluruh',
    body: 'Rata-rata otomatis, bobot tugas diatur bebas, rapor tinggal unduh.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Import Excel dalam 1 menit',
    body: 'Upload daftar siswa lama — kolom dipetakan otomatis, langsung siap.',
  },
  {
    icon: ChartColumnBig,
    title: 'Analitik yang mudah dibaca',
    body: 'Tren kehadiran dan performa siswa dalam grafik sederhana, bukan tumpukan angka.',
  },
]

const ROWS = [
  {
    name: 'Andini P.',
    status: 'Hadir',
    statusColor: 'text-secondary',
    grade: 88,
  },
  { name: 'Bima R.', status: 'Izin', statusColor: 'text-primary', grade: 91 },
  {
    name: 'Citra S.',
    status: 'Hadir',
    statusColor: 'text-secondary',
    grade: 76,
  },
]

export function Solution() {
  return (
    <section
      id="solusi"
      className="scroll-mt-[88px] border-t border-dashed border-landing-line bg-card py-[100px]"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHeading label="Bab 3 · Solusinya" />
        <h2 className="font-display mb-4 text-balance text-[clamp(1.8rem,4vw,2.5rem)] font-semibold leading-[1.18] tracking-[-0.02em]">
          TeachFlow: satu dasbor untuk seluruh admin kelas
        </h2>
        <p className="max-w-[600px] text-[1.05rem] text-muted-foreground">
          Dari daftar siswa sampai laporan akhir — semua ada di satu tempat yang
          rapi.
        </p>
        <div className="mt-12 grid items-center gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-[22px]">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i}
                className="flex items-start gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 -rotate-3 place-items-center rounded-[14px] bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display mb-1 text-[1.02rem] font-semibold">
                    {f.title}
                  </h3>
                  <p className="text-[0.9rem] text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={1} className="relative">
            <HandArrow className="absolute left-[-76px] top-[40%] rotate-180 text-secondary max-[900px]:hidden" />
            <div className="rotate-[1.2deg] rounded-[6px] border border-border bg-paper p-3.5 pb-10 shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
              <div className="overflow-hidden rounded-[4px] border border-border">
                <div className="bg-background p-[18px]">
                  <div className="flex gap-2.5">
                    <div className="flex-1 rounded-[var(--radius)] border border-border bg-background p-2.5">
                      <b className="font-display block text-[1.05rem] text-primary">
                        32
                      </b>
                      <span className="text-[0.68rem] text-muted-foreground">
                        Siswa
                      </span>
                    </div>
                    <div className="flex-1 rounded-[var(--radius)] border border-border bg-background p-2.5">
                      <b className="font-display block text-[1.05rem] text-secondary">
                        98%
                      </b>
                      <span className="text-[0.68rem] text-muted-foreground">
                        Hadir hari ini
                      </span>
                    </div>
                    <div className="flex-1 rounded-[var(--radius)] border border-border bg-background p-2.5">
                      <b className="font-display block text-[1.05rem] text-primary">
                        Rp0
                      </b>
                      <span className="text-[0.68rem] text-muted-foreground">
                        Biaya beta
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-[2fr_1fr_1fr] rounded-[var(--radius)] bg-muted px-3 py-2 text-[0.72rem] font-semibold text-muted-foreground">
                    <span>Siswa</span>
                    <span>Status</span>
                    <span>Nilai</span>
                  </div>
                  {ROWS.map((r) => (
                    <div
                      key={r.name}
                      className="grid grid-cols-[2fr_1fr_1fr] border-b border-dashed border-border px-3 py-1.5 text-[0.74rem]"
                    >
                      <span>{r.name}</span>
                      <span className={`font-semibold ${r.statusColor}`}>
                        {r.status}
                      </span>
                      <span>{r.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="font-hand mt-3 text-center text-[1.2rem] text-muted-foreground">
                begini penampakan kelas 7A siang itu
              </div>
            </div>
            <Tape
              className="absolute left-1/2 top-[-12px] -translate-x-1/2 -rotate-2"
              color="var(--secondary)"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
