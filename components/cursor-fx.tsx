'use client'

import { useEffect, useRef } from 'react'

export default function CursorFx() {
  const glow = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let gx = mx, gy = my
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      gx += (mx - gx) * 0.08
      gy += (my - gy) * 0.08
      if (glow.current)
        glow.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={glow} className="apple-cursor-glow" aria-hidden />
}
