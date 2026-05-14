'use client'

import Link from 'next/link'

const NAV_LINKS = [
  { href: '/#work', label: 'Work' },
  { href: '/#writing', label: 'Writing' },
  { href: '/cv', label: 'CV' },
  { href: '/game', label: 'Game' },
  { href: '/chat', label: 'Chat' },
]

function openCommandPalette() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
  )
}

export default function TopNav() {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 48,
        background: 'var(--bg-elevated)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        backdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '0.5px solid var(--rule)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          fontSize: 13,
          color: 'var(--ink-2)',
          gap: 4,
        }}
      >
        <Link
          href="/"
          aria-label="Home"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--ink)',
            textDecoration: 'none',
            marginRight: 18,
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              background:
                'linear-gradient(135deg, var(--apple-accent), #a855f7)',
              color: 'white',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.02em',
              boxShadow:
                '0 2px 8px color-mix(in srgb, var(--apple-accent) 35%, transparent)',
            }}
          >
            YQ
          </span>
          <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>
            Yanpeng Qi
          </span>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="apple-nav-link"
              style={{
                padding: '0 12px',
                lineHeight: '48px',
                fontSize: 13,
                color: 'var(--ink-2)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Open command palette"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 10px 5px 12px',
            borderRadius: 999,
            fontSize: 12,
            color: 'var(--ink-3)',
            border: '0.5px solid var(--rule)',
            background: 'var(--bg-elevated)',
            cursor: 'pointer',
            fontFamily: 'var(--font-apple-sans)',
          }}
          className="apple-nav-cmd"
        >
          <span>Search</span>
          <span style={{ fontFamily: 'var(--font-apple-mono)', opacity: 0.7 }}>⌘K</span>
        </button>
      </div>
    </nav>
  )
}
