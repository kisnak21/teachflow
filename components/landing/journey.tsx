import { Reveal } from './reveal'

export function Journey() {
  return (
    <section id="perjalanan" className="chapter journey">
      <div className="container">
        <span className="ch-label">Bab 2 · Perjalanannya</span>
        <h2 className="ch-title font-display">
          Kami mulai dari pertanyaan sederhana
        </h2>
        <p className="ch-sub">
          Bagaimana kalau semua administrasi itu bisa selesai dalam hitungan
          klik — sambil guru tetap fokus di depan kelas?
        </p>
        <div className="journey-list">
          <Reveal className="j-item">
            <span className="j-num">1</span>
            <div>
              <h3 className="font-display">
                Absensi jadi sekali klik
                <span className="note">(ini yang paling disuka!)</span>
              </h3>
              <p>
                Daftar siswa langsung tampil, centang yang hadir, sisanya
                otomatis jadi data — rekap bulanan ikut tersusun sendiri.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1} className="j-item">
            <span className="j-num">2</span>
            <div>
              <h3 className="font-display">
                RPP cukup tulis topiknya
                <span className="note">(AI-nya rajin banget)</span>
              </h3>
              <p>
                AI yang menyusun draf lengkap: tujuan pembelajaran, aktivitas,
                dan asesmen. Kamu tinggal menyempurnakan.
              </p>
            </div>
          </Reveal>
          <Reveal delay={2} className="j-item">
            <span className="j-num">3</span>
            <div>
              <h3 className="font-display">
                Nilai tersusun, rapor siap
                <span className="note">(bye bye, error Excel!)</span>
              </h3>
              <p>
                Semua nilai masuk ke satu tempat. Rata-rata, rekap, dan laporan
                tersusun otomatis — tinggal unduh.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
