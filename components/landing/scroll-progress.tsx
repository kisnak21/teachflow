'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [width, setWidth] = useState('0%')

  useEffect(() => {
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setWidth(total > 0 ? `${(window.scrollY / total) * 100}%` : '0%')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-progress" style={{ width }} aria-hidden="true" />
  )
}
