'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const tileBase: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--r-xl)',
  padding: 36,
  position: 'relative',
  overflow: 'hidden',
  border: '0.5px solid var(--rule)',
  boxShadow: 'var(--shadow-card)',
  transition: 'transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 360,
  fontFamily: 'var(--font-apple-sans)',
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-apple-mono)',
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  marginBottom: 10,
  fontWeight: 500,
}
const tileTitle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  margin: '0 0 12px',
  color: 'var(--ink)',
}
const tileSub: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.55,
  color: 'var(--ink-2)',
  margin: 0,
  letterSpacing: '-0.005em',
  maxWidth: '52ch',
}
const cta: React.CSSProperties = {
  marginTop: 18,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  color: 'var(--apple-accent)',
  fontSize: 14,
  textDecoration: 'none',
}

function AdmitlyAnim() {
  return (
    <svg
      width="100%"
      viewBox="0 0 480 170"
      preserveAspectRatio="xMidYMid meet"
      style={{ marginTop: 'auto', maxWidth: 480, alignSelf: 'stretch' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="adGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2997ff" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
        <filter id="adGlow">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <path d="M40 85 L160 85" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M160 85 L300 40" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M160 85 L300 85" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M160 85 L300 130" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M300 40 L420 85" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M300 85 L420 85" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <path d="M300 130 L420 85" stroke="rgba(255,255,255,.18)" strokeWidth="1" fill="none" />
      <g>
        <circle cx="40" cy="85" r="18" fill="url(#adGrad)" />
        <text x="40" y="125" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.7)">query</text>
      </g>
      <g>
        <circle cx="160" cy="85" r="22" fill="url(#adGrad)" opacity=".88" />
        <text x="160" y="130" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.7)">embed</text>
      </g>
      <g>
        <circle cx="300" cy="40" r="14" fill="url(#adGrad)" />
        <text x="300" y="22" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.6)">BM25</text>
        <circle cx="300" cy="85" r="14" fill="url(#adGrad)" />
        <text x="300" y="108" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.6)">vec</text>
        <circle cx="300" cy="130" r="14" fill="url(#adGrad)" />
        <text x="300" y="152" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.6)">RRF</text>
      </g>
      <g>
        <circle cx="420" cy="85" r="22" fill="url(#adGrad)" />
        <circle cx="420" cy="85" r="22" fill="none" stroke="#2997ff" strokeWidth="1" style={{ transformOrigin: '420px 85px', animation: 'apple-adPulse 2.4s ease-out infinite' }} />
        <text x="420" y="130" textAnchor="middle" fontFamily="ui-monospace,SF Mono,monospace" fontSize="9" fill="rgba(255,255,255,.7)">answer</text>
      </g>
      <circle r="3" fill="#2997ff" filter="url(#adGlow)">
        <animateMotion dur="3.2s" repeatCount="indefinite" path="M40 85 L160 85 L300 40 L420 85" />
      </circle>
      <circle r="3" fill="#a855f7" filter="url(#adGlow)">
        <animateMotion dur="3.2s" begin="0.4s" repeatCount="indefinite" path="M40 85 L160 85 L300 85 L420 85" />
      </circle>
      <circle r="3" fill="#34d399" filter="url(#adGlow)">
        <animateMotion dur="3.2s" begin="0.8s" repeatCount="indefinite" path="M40 85 L160 85 L300 130 L420 85" />
      </circle>
    </svg>
  )
}

function CoreStack() {
  const rows = [
    { k: 'Eval', v: 'LLM-as-judge · 92%' },
    { k: 'Route', v: 'Haiku → Sonnet' },
    { k: 'Retrieve', v: 'BM25 + vec + RRF' },
    { k: 'Index', v: 'chunked · cached' },
  ]
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        paddingTop: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {rows.map((r, i) => (
        <div
          key={r.k}
          className="apple-core-layer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderRadius: 8,
            border: '0.5px solid var(--rule)',
            background:
              i === rows.length - 1
                ? 'color-mix(in srgb, var(--bg-card) 60%, transparent)'
                : 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontSize: 12,
            transition: 'transform .25s, box-shadow .25s',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--ink)',
              letterSpacing: '-0.005em',
              fontSize: 11,
            }}
          >
            {r.k}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-apple-mono)',
              fontSize: 10,
              color: 'var(--ink-3)',
            }}
          >
            {r.v}
          </span>
        </div>
      ))}
    </div>
  )
}

function LangGrid() {
  const cells = [
    { b: 'Java / Spring', s: 'JVM' },
    { b: 'TS / Next.js', s: 'Edge' },
    { b: 'Py / FastAPI', s: 'ML' },
    { b: 'SQL', s: 'pgvector' },
    { b: 'K8s / AWS', s: 'Bedrock' },
    { b: 'MCP / Tools', s: 'Agents' },
  ]
  return (
    <div
      aria-hidden
      style={{
        width: '100%',
        paddingTop: 16,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
      }}
    >
      {cells.map(c => (
        <div
          key={c.b}
          className="apple-lang-cell"
          style={{
            aspectRatio: '2 / 1',
            borderRadius: 8,
            border: '0.5px solid var(--rule)',
            background: 'var(--bg-section)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            transition: 'transform .25s, background .25s',
          }}
        >
          <b
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--ink)',
            }}
          >
            {c.b}
          </b>
          <span
            style={{
              fontSize: 9,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-apple-mono)',
            }}
          >
            {c.s}
          </span>
        </div>
      ))}
    </div>
  )
}

function useTileSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(hover: none)').matches) return
    const tiles = document.querySelectorAll<HTMLElement>('.apple-tile')
    const handlers: Array<[HTMLElement, (e: MouseEvent) => void]> = []
    tiles.forEach(el => {
      const h = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      el.addEventListener('mousemove', h)
      handlers.push([el, h])
    })
    return () => {
      handlers.forEach(([el, h]) => el.removeEventListener('mousemove', h))
    }
  }, [])
}

export default function TileGrid() {
  useTileSpotlight()
  return (
    <section
      id="work"
      style={{
        padding: '96px 22px',
        background: 'var(--bg-section)',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-apple-mono)',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 18,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          About
        </div>
        <h2
          style={{
            fontSize: 'clamp(36px, 4.5vw, 56px)',
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            fontWeight: 600,
            margin: '0 0 56px',
            textAlign: 'center',
            textWrap: 'balance',
            color: 'var(--ink)',
          }}
        >
          Engineering for the AI era.
        </h2>

        <div
          className="apple-tile-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 16,
          }}
        >
          {/* Span-6 split — Admitly hero tile */}
          <article
            className="apple-tile apple-spotlight"
            style={{
              ...tileBase,
              gridColumn: 'span 6',
              background: '#1d1d1f',
              color: '#f5f5f7',
              borderColor: 'rgba(255,255,255,.06)',
              padding: 44,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
              gap: 36,
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ ...eyebrow, color: 'rgba(245,245,247,.7)' }}>Featured</div>
              <h3 style={{ ...tileTitle, color: '#f5f5f7' }}>
                Admitly. Your AI study-abroad consultant.
              </h3>
              <p style={{ ...tileSub, color: 'rgba(245,245,247,.78)' }}>
                Hybrid search · pgvector · Claude · LLM-as-judge. End-to-end.
              </p>
              <Link href="/projects/admitly" style={{ ...cta, color: '#2997ff' }}>
                Read case study →
              </Link>
            </div>
            <AdmitlyAnim />
          </article>

          {/* Span-3 accent — Production AI Core */}
          <article
            className="apple-tile apple-spotlight apple-tile-accent"
            style={{
              ...tileBase,
              gridColumn: 'span 3',
              background: 'linear-gradient(135deg, #f0f5ff 0%, #e8eeff 100%)',
              borderColor: 'rgba(0,113,227,.12)',
            }}
          >
            <div style={eyebrow}>Specialty</div>
            <h3 style={tileTitle}>Production AI Core.</h3>
            <p style={tileSub}>
              Retrieval, orchestration, reliability. The boring parts that make the
              magic real.
            </p>
            <Link href="/#work" style={cta}>
              How I think about it →
            </Link>
            <CoreStack />
          </article>

          {/* Span-3 — Full-stack with depth */}
          <article
            className="apple-tile apple-spotlight"
            style={{
              ...tileBase,
              gridColumn: 'span 3',
            }}
          >
            <div style={eyebrow}>Background</div>
            <h3 style={tileTitle}>Full-stack with depth.</h3>
            <p style={tileSub}>
              Java + Spring on the JVM. TypeScript + Next.js on the edge. Python
              where the models live.
            </p>
            <Link href="/cv" style={cta}>
              See CV →
            </Link>
            <LangGrid />
          </article>

          {/* Span-2 dark — AI Chat */}
          <article
            className="apple-tile apple-spotlight"
            style={{
              ...tileBase,
              gridColumn: 'span 2',
              background: '#1d1d1f',
              color: '#f5f5f7',
              borderColor: 'rgba(255,255,255,.06)',
              minHeight: 280,
            }}
          >
            <div style={{ ...eyebrow, color: 'rgba(245,245,247,.7)' }}>AI Chat</div>
            <h3 style={{ ...tileTitle, color: '#f5f5f7' }}>Try it.</h3>
            <p style={{ ...tileSub, color: 'rgba(245,245,247,.78)' }}>
              Ask my AI anything about my work.
            </p>
            <Link href="/chat" style={{ ...cta, color: '#2997ff', marginTop: 'auto' }}>
              Open chat →
            </Link>
          </article>

          {/* Span-2 — Writing */}
          <article
            className="apple-tile apple-spotlight"
            style={{
              ...tileBase,
              gridColumn: 'span 2',
              minHeight: 280,
            }}
          >
            <div style={eyebrow}>Writing</div>
            <h3 style={tileTitle}>Notes.</h3>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '14px 0 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 14,
                color: 'var(--ink-2)',
                marginTop: 'auto',
              }}
            >
              <li className="hairline-b" style={{ paddingBottom: 10 }}>
                <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>
                  How I think about RAG eval harnesses
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Routing models without lighting money on fire
                </Link>
              </li>
            </ul>
          </article>

          {/* Span-2 — Open source */}
          <article
            className="apple-tile apple-spotlight"
            style={{
              ...tileBase,
              gridColumn: 'span 2',
              minHeight: 280,
            }}
          >
            <div style={eyebrow}>Open source</div>
            <h3 style={tileTitle}>Repos.</h3>
            <p style={tileSub}>
              A public trail of small, sharp tools and experiments.
            </p>
            <Link href="/repositories" style={{ ...cta, marginTop: 'auto' }}>
              View on GitHub →
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}
