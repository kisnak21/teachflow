import { Sparkles } from 'lucide-react'
import { Reveal } from './reveal'
import { Tape } from './doodles'

export function AiShowcase() {
  return (
    <section id="ai" className="chapter ai-showcase">
      <div className="container">
        <span className="ch-label">Bab 4 · Sentuhan AI</span>
        <h2 className="ch-title font-display">
          RPP yang biasanya 2 jam, sekarang 20 detik
        </h2>
        <p className="ch-sub">
          Tulis topiknya, AI menyusun kerangkanya. Kamu yang memegang kendali —
          AI hanya mempercepat.
        </p>
        <Reveal className="ai-box">
          <Tape color="var(--primary)" />
          <div className="ai-prompt">
            <Sparkles
              className="h-[18px] w-[18px] shrink-0"
              style={{ color: 'var(--primary)' }}
            />
            <span>
              &quot;Buatkan RPP Matematika kelas 7, materi aljabar, 2 JP&quot;
            </span>
            <span className="spark">
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </span>
          </div>
          <div className="ai-output">
            <div className="o-title">Draf RPP siap — 20 detik</div>
            <ul>
              <li>Tujuan pembelajaran &amp; indikator ketercapaian</li>
              <li>Aktivitas: pendahuluan, inti, penutup (sesuai 2 JP)</li>
              <li>Asesmen formatif + kunci jawaban singkat</li>
              <li>Dapat diedit, disimpan, dan diekspor PDF</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
