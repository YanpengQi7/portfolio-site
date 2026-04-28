'use client'

import Link from 'next/link'

type Variant = 'keynote' | 'editorial' | 'desktop'

function HeroBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.25,
          top: -180,
          left: -120,
          background:
            'radial-gradient(circle at 30% 30%, var(--apple-accent), transparent 70%)',
          animation: 'apple-float1 18s ease-in-out infinite',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.25,
          top: 40,
          right: -160,
          background:
            'radial-gradient(circle at 60% 40%, #a855f7, transparent 70%)',
          animation: 'apple-float2 22s ease-in-out infinite',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.18,
          bottom: -240,
          left: '30%',
          background:
            'radial-gradient(circle at 50% 50%, #34d399, transparent 70%)',
          animation: 'apple-float3 26s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 60% 60% at 50% 40%, black, transparent 75%)',
          opacity: 0.25,
        }}
      />
    </div>
  )
}

function KeynoteHero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: '80px 22px 56px',
        overflow: 'hidden',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <HeroBackground />
      <div
        className="apple-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 11px',
            borderRadius: 999,
            background: 'color-mix(in srgb, var(--apple-accent) 10%, transparent)',
            color: 'var(--apple-accent)',
            fontSize: 12,
            fontWeight: 500,
            border:
              '0.5px solid color-mix(in srgb, var(--apple-accent) 18%, transparent)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#34c759',
              boxShadow: '0 0 0 2px color-mix(in srgb, #34c759 25%, transparent)',
              display: 'inline-block',
            }}
          />
          Open to opportunities · Greater Seattle
        </div>
        <div
          style={{
            fontFamily: 'var(--font-apple-mono)',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginTop: 28,
            marginBottom: 22,
            fontWeight: 500,
          }}
        >
          YANPENG&nbsp;QI
        </div>
        <h1
          style={{
            fontSize: 'clamp(56px, 8vw, 96px)',
            lineHeight: 1.05,
            letterSpacing: '-0.045em',
            fontWeight: 600,
            margin: '0 0 20px',
            color: 'var(--ink)',
            textWrap: 'balance',
          }}
        >
          Software with a <span className="apple-shimmer">thinking</span> layer.
        </h1>
        <p
          style={{
            fontSize: 'clamp(19px, 2.2vw, 24px)',
            lineHeight: 1.4,
            letterSpacing: '-0.012em',
            fontWeight: 400,
            color: 'var(--ink-2)',
            maxWidth: 720,
            margin: '0 auto 32px',
            textWrap: 'balance',
          }}
        >
          Software engineer building production AI systems — RAG pipelines,
          multi-agent orchestration, LLM integrations at scale.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/#work"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              borderRadius: 980,
              background: 'var(--apple-accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              transition: 'background .2s',
            }}
          >
            View work
          </Link>
          <Link
            href="/chat"
            className="apple-link-arrow"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--apple-accent)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Talk to my AI →
          </Link>
        </div>
      </div>
    </section>
  )
}

function EditorialHero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        padding: '96px 22px 56px',
        overflow: 'hidden',
        textAlign: 'left',
        maxWidth: 1080,
        margin: '0 auto',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <HeroBackground />
      <div className="apple-fade-in" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--font-apple-mono)',
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          YANPENG QI
        </div>
        <h1
          style={{
            fontSize: 'clamp(48px, 7vw, 80px)',
            lineHeight: 0.98,
            letterSpacing: '-0.05em',
            fontWeight: 600,
            margin: '0 0 28px',
            maxWidth: '14ch',
            color: 'var(--ink)',
          }}
        >
          Software, with the{' '}
          <em
            style={{
              fontFamily: 'var(--font-apple-serif)',
              fontStyle: 'italic',
              fontWeight: 500,
              color: 'var(--ink-2)',
            }}
          >
            thinking layer
          </em>{' '}
          in mind.
        </h1>
        <p
          style={{
            fontSize: 22,
            lineHeight: 1.4,
            color: 'var(--ink-2)',
            maxWidth: '56ch',
            margin: '0 0 36px',
            letterSpacing: '-0.012em',
          }}
        >
          Five years shipping production systems. Currently building Admitly — an
          AI-native graduate admission copilot with hybrid search, model routing,
          and LLM-as-judge eval.
        </p>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/#work"
            style={{
              padding: '12px 24px',
              borderRadius: 980,
              background: 'var(--apple-accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View work
          </Link>
          <Link
            href="/chat"
            style={{
              color: 'var(--apple-accent)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Talk to my AI →
          </Link>
        </div>
      </div>
    </section>
  )
}

function DesktopHero() {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: '60px 22px 56px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, var(--bg-apple) 0%, var(--bg-section) 100%)',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <HeroBackground />
      <div
        className="apple-fade-in"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            color: 'var(--ink-3)',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          Yanpeng Qi · Software Engineer
        </div>
        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 68px)',
            lineHeight: 1.06,
            letterSpacing: '-0.04em',
            fontWeight: 600,
            margin: '0 0 14px',
          }}
        >
          <span className="apple-shimmer">Yanpeng Qi.</span>
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.4,
            color: 'var(--ink-2)',
            maxWidth: 640,
            margin: '0 auto 36px',
            letterSpacing: '-0.01em',
          }}
        >
          Software engineer · AI builder · Apple-grade execution. Currently
          building Admitly.
        </p>

        <div
          className="apple-spotlight"
          style={{
            margin: '0 auto',
            maxWidth: 920,
            background: 'var(--bg-card)',
            borderRadius: 22,
            boxShadow: 'var(--shadow-pop)',
            border: '0.5px solid var(--rule)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              background: 'var(--bg-section)',
              borderBottom: '0.5px solid var(--rule)',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
            </div>
            <span
              style={{
                marginLeft: 12,
                fontFamily: 'var(--font-apple-mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
              }}
            >
              ~/yanpeng — zsh — 80×24
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-apple-mono)',
              fontSize: 13,
              lineHeight: 1.7,
              padding: '22px 26px',
              color: 'var(--ink-2)',
            }}
          >
            <div><span style={{ color: 'var(--ink-3)' }}>$</span>{' '}<span style={{ color: 'var(--apple-accent)' }}>gh</span> repo view yanpeng-qi/portfolio</div>
            <div>name: portfolio-site · stars: ★★★★★</div>
            <div>stack: Next.js 16 · React 19 · Tailwind v4 · AI SDK</div>
            <div><span style={{ color: 'var(--ink-3)' }}>$</span>{' '}<span style={{ color: 'var(--apple-accent)' }}>cat</span> about.md</div>
            <div>building Admitly — hybrid search · model routing · evals</div>
            <div><span style={{ color: 'var(--ink-3)' }}>$</span>{' '}<span style={{ color: 'var(--ink-4)' }}>▍</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Hero({ variant = 'keynote' }: { variant?: Variant }) {
  if (variant === 'editorial') return <EditorialHero />
  if (variant === 'desktop') return <DesktopHero />
  return <KeynoteHero />
}
