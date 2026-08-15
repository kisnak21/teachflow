'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthCta } from './auth-cta'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '#masalah', label: 'Masalah' },
  { href: '#perjalanan', label: 'Perjalanan' },
  { href: '#solusi', label: 'Solusi' },
  { href: '#harga', label: 'Harga' },
]

export function Navbar({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 60)
        ticking.current = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 w-full border-b border-transparent transition-colors duration-250',
        scrolled && 'border-border bg-background/90 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between px-6">
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
        <div className="flex gap-[26px] text-sm font-medium max-[900px]:hidden">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthCta
            className="hidden min-[640px]:inline-flex"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Daftar Gratis"
          />
          <button
            type="button"
            className="hidden h-10 w-10 cursor-pointer touch-manipulation place-items-center rounded-xl border border-border bg-muted text-foreground tap-highlight-transparent transition-colors duration-180 hover:bg-muted/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[900px]:grid"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div
          id="nav-menu"
          className="absolute left-0 right-0 top-[68px] border-b border-border bg-background/95 px-6 pb-6 pt-2 backdrop-blur-md"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 font-medium text-muted-foreground no-underline hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {l.label}
            </a>
          ))}
          <AuthCta
            className="mt-4 w-full"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Daftar Gratis"
          />
        </div>
      )}
    </nav>
  )
}
