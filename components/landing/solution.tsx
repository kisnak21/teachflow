import {
  CalendarCheck,
  FileSpreadsheet,
  ChartColumnBig,
  FilePlus2,
} from 'lucide-react'
import { Reveal } from './reveal'
import { HandArrow } from './doodles'

export function Solution() {
  return (
    <section id="solusi" className="chapter solution">
      <div className="container">
        <span className="ch-label">Bab 3 · Solusinya</span>
        <h2 className="ch-title font-display">
          TeachFlow: satu dasbor untuk seluruh admin kelas
        </h2>
        <p className="ch-sub">
          Dari daftar siswa sampai laporan akhir — semua ada di satu tempat yang
          rapi.
        </p>
        <div className="showcase">
          <div className="feat-bullets">
            <Reveal className="fb">
              <span className="fb-icon">
                <CalendarCheck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display">Absensi &amp; rekap otomatis</h3>
                <p>
                  Ekspor PDF atau Excel kapan pun, tanpa menghitung manual lagi.
                </p>
              </div>
            </Reveal>
            <Reveal delay={1} className="fb">
              <span className="fb-icon">
                <FilePlus2 className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display">Rekap nilai menyeluruh</h3>
                <p>
                  Rata-rata otomatis, bobot tugas diatur bebas, rapor tinggal
                  unduh.
                </p>
              </div>
            </Reveal>
            <Reveal delay={2} className="fb">
              <span className="fb-icon">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display">Import Excel dalam 1 menit</h3>
                <p>
                  Upload daftar siswa lama — kolom dipetakan otomatis, langsung
                  siap.
                </p>
              </div>
            </Reveal>
            <Reveal delay={3} className="fb">
              <span className="fb-icon">
                <ChartColumnBig className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display">Analitik yang mudah dibaca</h3>
                <p>
                  Tren kehadiran dan performa siswa dalam grafik sederhana,
                  bukan tumpukan angka.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={1} className="polaroid">
            <HandArrow className="doodle-arrow" />
            <div className="frame">
              <div className="inner">
                <div style={{ padding: 18, background: 'var(--background)' }}>
                  <div className="flex gap-2.5">
                    <div className="stat-box flex-1">
                      <b style={{ color: 'var(--primary)' }}>32</b>
                      <span>Siswa</span>
                    </div>
                    <div className="stat-box flex-1">
                      <b style={{ color: 'var(--secondary)' }}>98%</b>
                      <span>Hadir hari ini</span>
                    </div>
                    <div className="stat-box flex-1">
                      <b style={{ color: 'var(--primary)' }}>Rp0</b>
                      <span>Biaya beta</span>
                    </div>
                  </div>
                  <div className="tbl-head">
                    <span>Siswa</span>
                    <span>Status</span>
                    <span>Nilai</span>
                  </div>
                  <div className="tbl-row">
                    <span>Andini P.</span>
                    <span
                      style={{ color: 'var(--secondary)', fontWeight: 600 }}
                    >
                      Hadir
                    </span>
                    <span>88</span>
                  </div>
                  <div className="tbl-row">
                    <span>Bima R.</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      Izin
                    </span>
                    <span>91</span>
                  </div>
                  <div className="tbl-row">
                    <span>Citra S.</span>
                    <span
                      style={{ color: 'var(--secondary)', fontWeight: 600 }}
                    >
                      Hadir
                    </span>
                    <span>76</span>
                  </div>
                </div>
              </div>
              <div className="caption">
                begini penampakan kelas 7A siang itu
              </div>
            </div>
            <div
              className="tape"
              style={
                { '--tape-color': 'var(--secondary)' } as React.CSSProperties
              }
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
