'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      const doc = document.documentElement
      const scrollableHeight = doc.scrollHeight - window.innerHeight
      const next = scrollableHeight <= 0 ? 0 : Math.min(window.scrollY / scrollableHeight, 1)
      setProgress(next)
      frame = 0
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="reading-progress" aria-hidden>
      <div
        className="reading-progress__bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
