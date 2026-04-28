'use client'

import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'splash-seen'

export default function LandingSplash() {
  const [mounted, setMounted] = useState(false)
  const [gone, setGone] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(STORAGE_KEY) === '1') return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const dismiss = (e?: Event) => {
      if (e && 'key' in e) {
        const k = (e as KeyboardEvent).key
        if (k !== 'Enter' && k !== ' ' && k !== 'Escape') return
        e.preventDefault()
      }
      try { window.sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
      setGone(true)
      document.body.style.overflow = ''
      window.setTimeout(() => setMounted(false), 1000)
    }
    const onKey = (e: KeyboardEvent) => dismiss(e)
    const onWheel = () => dismiss()
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { once: true, passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Click to enter"
      onClick={() => {
        try { window.sessionStorage.setItem(STORAGE_KEY, '1') } catch {}
        setGone(true)
        document.body.style.overflow = ''
        window.setTimeout(() => setMounted(false), 1000)
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-apple)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'hidden',
        opacity: gone ? 0 : 1,
        transform: gone ? 'scale(1.06)' : 'none',
        visibility: gone ? 'hidden' : 'visible',
        pointerEvents: gone ? 'none' : 'auto',
        transition:
          'opacity .9s cubic-bezier(.2,.8,.2,1), transform .9s cubic-bezier(.2,.8,.2,1), visibility 0s linear .9s',
      }}
      className="splash-root"
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <span
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            filter: 'blur(110px)',
            opacity: 0.55,
            top: -240,
            left: -180,
            background: 'radial-gradient(circle, var(--apple-accent), transparent 70%)',
            animation: 'apple-sbf1 14s ease-in-out infinite',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            filter: 'blur(110px)',
            opacity: 0.55,
            top: '20%',
            right: -200,
            background: 'radial-gradient(circle, #a855f7, transparent 70%)',
            animation: 'apple-sbf2 18s ease-in-out infinite',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            filter: 'blur(110px)',
            opacity: 0.35,
            bottom: -260,
            left: '30%',
            background: 'radial-gradient(circle, #34d399, transparent 70%)',
            animation: 'apple-sbf3 22s ease-in-out infinite',
          }}
        />
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 50% 50% at 50% 50%, black, transparent 75%)',
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          animation: 'apple-splashIn 1.2s cubic-bezier(.2,.8,.2,1) both',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-apple-sans)',
            fontSize: 'clamp(140px, 22vw, 280px)',
            fontWeight: 700,
            letterSpacing: '-0.06em',
            lineHeight: 0.9,
            background:
              'linear-gradient(135deg, var(--apple-accent), #a855f7 55%, #34d399)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            animation: 'apple-yqShine 6s ease-in-out infinite',
            marginBottom: 18,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: 'apple-yqDrop 1.2s cubic-bezier(.2,.8,.2,1) both',
            }}
          >
            Y
          </span>
          <span
            style={{
              display: 'inline-block',
              animation: 'apple-yqDrop 1.2s cubic-bezier(.2,.8,.2,1) .12s both',
            }}
          >
            Q
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-apple-mono)',
            fontSize: 'clamp(11px, 1.2vw, 14px)',
            letterSpacing: '0.6em',
            textIndent: '0.6em',
            color: 'var(--ink-3)',
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          YANPENG&nbsp;&nbsp;QI
        </div>
        <div
          style={{
            fontSize: 'clamp(15px, 1.6vw, 19px)',
            color: 'var(--ink-2)',
            letterSpacing: '-0.01em',
            marginBottom: 56,
          }}
        >
          Software Engineer · AI Builder
        </div>
        <div
          className="splash-enter"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            color: 'var(--ink-3)',
            fontFamily: 'var(--font-apple-mono)',
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            animation: 'apple-enterPulse 2.4s ease-in-out infinite',
          }}
        >
          <span className="splash-line" />
          <span>Click to enter</span>
          <span className="splash-line" />
        </div>
      </div>
    </div>
  )
}
