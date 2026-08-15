'use client'

import { useEffect, useRef } from 'react'

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  const ticking = useRef(false)

  useEffect(() => {
    function update() {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%'
      if (barRef.current) barRef.current.style.width = width
      ticking.current = false
    }
    function onScroll() {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div ref={barRef} className="landing-progress" aria-hidden="true" />
}
