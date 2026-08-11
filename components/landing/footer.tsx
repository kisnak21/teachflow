import { GraduationCap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <a className="logo" href="#">
              <span className="logo-mark">
                <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
              </span>
              TeachFlow
            </a>
            <p>
              Asisten administratif untuk guru Indonesia. Fokus mengajar, biar
              kami yang urus sisanya.
            </p>
            <p className="hand-note">salam hangat dari tim TeachFlow!</p>
          </div>
          <div>
            <h4>Produk</h4>
            <a href="#masalah">Masalah</a>
            <a href="#solusi">Solusi</a>
            <a href="#harga">Harga</a>
            <a href="#">Log Perubahan</a>
          </div>
          <div>
            <h4>Dukungan</h4>
            <a href="#">Pusat Bantuan</a>
            <a href="#">Panduan</a>
            <a href="#">Hubungi Kami</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat &amp; Ketentuan</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 TeachFlow. Dibuat oleh guru, untuk guru.</span>
          <span>Landing page — Playful Storytelling</span>
        </div>
      </div>
    </footer>
  )
}
