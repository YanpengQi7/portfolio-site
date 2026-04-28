'use client'

import { useEffect, useRef } from 'react'

export default function CursorFx() {
  const glow = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let gx = mx, gy = my, rx = mx, ry = my
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      const t = e.target as HTMLElement | null
      const grow = !!t?.closest(
        'a, button, [data-cursor-grow], .apple-tile, .apple-spotlight'
      )
      if (ring.current) ring.current.classList.toggle('is-grow', grow)
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      gx += (mx - gx) * 0.08
      gy += (my - gy) * 0.08
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      if (glow.current)
        glow.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`
      if (ring.current)
        ring.current.style.transform += ` translate3d(${rx}px, ${ry}px, 0)`
      // Set transform via separate prop to keep grow scale + position composable.
      if (ring.current) {
        const grow = ring.current.classList.contains('is-grow')
        ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${
          grow ? 1.75 : 1
        })`
      }
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={glow} className="apple-cursor-glow" aria-hidden />
      <div ref={ring} className="apple-cursor-ring" aria-hidden />
    </>
  )
}
