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
    <nav className={cn('landing-nav', scrolled && 'scrolled')}>
      <div className="container nav-inner">
        <Link className="logo" href="/" translate="no">
          <span className="logo-mark">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </span>
          TeachFlow
        </Link>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthCta
            className="nav-cta"
            isAuthenticated={isAuthenticated}
            dashboardHref={dashboardHref}
            label="Daftar Gratis"
          />
          <button
            type="button"
            className="nav-burger"
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
        <div id="nav-menu" className="nav-menu">
          <div className="container">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <AuthCta
              isAuthenticated={isAuthenticated}
              dashboardHref={dashboardHref}
              label="Daftar Gratis"
            />
          </div>
        </div>
      )}
    </nav>
  )
}
