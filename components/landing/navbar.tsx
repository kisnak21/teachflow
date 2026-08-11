'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export function Navbar({
  isAuthenticated,
  dashboardHref,
}: {
  isAuthenticated: boolean
  dashboardHref: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={cn('landing-nav', scrolled && 'scrolled')}>
      <div className="container nav-inner">
        <a className="logo" href="#">
          <span className="logo-mark">
            <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
          </span>
          TeachFlow
        </a>
        <div className="nav-links">
          <a href="#masalah">Masalah</a>
          <a href="#perjalanan">Perjalanan</a>
          <a href="#solusi">Solusi</a>
          <a href="#harga">Harga</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link className="btn btn-primary" href={dashboardHref}>
              <LayoutDashboard className="h-4 w-4" />
              Buka Dashboard
            </Link>
          ) : (
            <Link className="btn btn-primary" href="/register">
              Daftar Gratis
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
