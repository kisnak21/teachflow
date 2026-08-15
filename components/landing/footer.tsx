import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-dashed border-landing-line bg-paper py-14 text-foreground">
      <div className="mx-auto max-w-[1080px] px-6">
        <div className="mb-[34px] grid gap-10 sm:grid-cols-[2fr_1fr]">
          <div>
            <Link
              className="font-display flex items-center gap-2.5 text-xl font-semibold text-foreground no-underline"
              href="/"
              translate="no"
            >
              <span className="grid h-9 w-9 -rotate-4 place-items-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
              </span>
              TeachFlow
            </Link>
            <p className="mt-2.5 max-w-[280px] text-[0.88rem] opacity-55">
              Asisten administratif untuk guru Indonesia. Fokus mengajar, biar
              kami yang urus sisanya.
            </p>
            <p className="font-hand mt-3.5 text-[1.05rem] text-primary">
              salam hangat dari tim TeachFlow!
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-[0.9rem] font-semibold">Produk</h4>
            <a
              href="#masalah"
              className="mb-2 block text-[0.88rem] text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Masalah
            </a>
            <a
              href="#solusi"
              className="mb-2 block text-[0.88rem] text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Solusi
            </a>
            <a
              href="#harga"
              className="mb-2 block text-[0.88rem] text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Harga
            </a>
            <a
              href="#ai"
              className="mb-2 block text-[0.88rem] text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Fitur AI
            </a>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[0.8rem] text-muted-foreground">
          <span>© 2026 TeachFlow. Dibuat oleh guru, untuk guru.</span>
          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/terms"
              className="no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Ketentuan Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
