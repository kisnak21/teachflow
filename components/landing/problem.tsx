import { Reveal } from './reveal'
import { Tape } from './doodles'

export function Problem() {
  return (
    <section id="masalah" className="chapter problem">
      <div className="container">
        <span className="ch-label">Bab 1 · Masalahnya</span>
        <h2 className="ch-title font-display">
          Mengajar itu berat. Administrasinya lebih berat lagi.
        </h2>
        <p className="ch-sub">
          Bukan karena kamu tidak bisa mengajar — tapi karena separuh waktumu
          tersedot pekerjaan yang seharusnya tidak perlu 3 jam.
        </p>
        <div className="pain-grid">
          <Reveal className="pain-card">
            <Tape color="var(--primary)" />
            <span className="num">01 / Absensi</span>
            <h3 className="font-display">
              Rekap manual yang tak pernah akurat
            </h3>
            <p>
              Menghitung kehadiran dari kertas, satu per satu. Begitu salah
              hitung, rekap sebulan harus diulang.
            </p>
          </Reveal>
          <Reveal delay={1} className="pain-card">
            <Tape color="var(--secondary)" />
            <span className="num">02 / RPP</span>
            <h3 className="font-display">Menulis RPP dari nol, tiap topik</h3>
            <p>
              Formatnya panjang, waktunya mepet, dan isinya nyaris sama dari
              tahun ke tahun.
            </p>
          </Reveal>
          <Reveal delay={2} className="pain-card">
            <Tape color="var(--primary)" />
            <span className="num">03 / Nilai</span>
            <h3 className="font-display">Excel yang berantakan</h3>
            <p>
              Rumus error, file versi ganda, dan laporan yang harus disusun
              ulang setiap semester.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
