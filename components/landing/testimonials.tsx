import { Reveal } from './reveal'

const QUOTES = [
  {
    text: 'Absensi yang dulu 2 jam tiap bulan, sekarang 5 menit. Rekapnya langsung rapi, tinggal print.',
    name: 'Bu Rina',
    school: 'SDN 3 Cikupa',
    detail: 'Guru kelas 5, 2 bulan pakai',
    tilt: 't1',
  },
  {
    text: 'RPP yang biasanya saya tulis 2 jam, dibantu AI jadi 20 menit. Saya tinggal edit sedikit-sedikit.',
    name: 'Pak Dedi',
    school: 'SMPN 12 Bandung',
    detail: 'Guru Matematika, 1 bulan pakai',
    tilt: 't2',
  },
  {
    text: 'Import Excel-nya jagoan banget. Daftar 240 siswa masuk dalam sekali upload, kolomnya ketemu sendiri.',
    name: 'Bu Sari',
    school: 'SMA PGRI Jogja',
    detail: 'Guru BK, 3 minggu pakai',
    tilt: 't3',
  },
]

export function Testimonials() {
  return (
    <section id="testi" className="chapter testimonials">
      <div className="container">
        <span className="ch-label">Catatan dari guru-guru</span>
        <h2 className="ch-title font-display">
          Kata mereka yang sudah mencoba
        </h2>
        <p className="ch-sub">
          Pesan asli dari guru yang mencoba TeachFlow saat beta.
        </p>
        <div className="testi-grid" style={{ marginTop: 44 }}>
          {QUOTES.map((q, i) => (
            <Reveal
              key={q.name}
              delay={i as 0 | 1 | 2}
              className={`postit ${q.tilt}`}
            >
              <p>&quot;{q.text}&quot;</p>
              <div className="who">
                {q.name} — {q.school}
                <span>{q.detail}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
