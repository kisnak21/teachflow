import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { Footer } from './footer'

export type LegalSection = {
  title: string
  body: string[]
}

export function LegalLayout({
  title,
  subtitle,
  sections,
}: {
  title: string
  subtitle: string
  sections: LegalSection[]
}) {
  return (
    <div className="bg-paper text-foreground">
      <header className="border-b border-dashed border-landing-line">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-6 py-5">
          <Link
            className="font-display flex items-center gap-2.5 text-lg font-semibold text-foreground no-underline"
            href="/"
            translate="no"
          >
            <span className="grid h-8 w-8 -rotate-4 place-items-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.2} />
            </span>
            TeachFlow
          </Link>
          <Link
            href="/"
            className="text-[0.88rem] text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            ← Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-14">
        <p className="mb-2 text-[0.85rem] font-medium tracking-wide text-primary uppercase">
          {subtitle}
        </p>
        <h1 className="font-display mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mb-10 text-[0.88rem] text-muted-foreground">
          Berlaku sejak 15 Agustus 2026
        </p>

        <div className="flex flex-col gap-9">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display mb-2.5 flex items-baseline gap-2.5 text-xl font-semibold">
                <span className="font-hand -rotate-3 text-primary">
                  {i + 1}.
                </span>
                {section.title}
              </h2>
              {section.body.map((paragraph, j) => (
                <p
                  key={j}
                  className="mb-3 text-[0.95rem] leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
