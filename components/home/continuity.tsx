const deviceBase: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 18,
  border: '0.5px solid var(--rule)',
  boxShadow: 'var(--shadow-card)',
  overflow: 'hidden',
  fontFamily: 'var(--font-apple-sans)',
}

const headBase: React.CSSProperties = {
  height: 28,
  background: 'var(--bg-section)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 12px',
  borderBottom: '0.5px solid var(--rule)',
}

function TrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--ink-4)',
          opacity: 0.5,
        }}
      />
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--ink-4)',
          opacity: 0.5,
        }}
      />
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--ink-4)',
          opacity: 0.5,
        }}
      />
    </div>
  )
}

export default function Continuity() {
  return (
    <section
      style={{
        padding: '96px 22px',
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
          Reach
        </div>
        <h2
          style={{
            fontSize: 'clamp(36px, 4.5vw, 56px)',
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            fontWeight: 600,
            margin: '0 0 16px',
            textAlign: 'center',
            color: 'var(--ink)',
          }}
        >
          Built on every surface.
        </h2>
        <p
          style={{
            fontSize: 19,
            color: 'var(--ink-2)',
            textAlign: 'center',
            maxWidth: 640,
            margin: '0 auto 56px',
            letterSpacing: '-0.01em',
          }}
        >
          Server, edge, browser, mobile — same care, same standard.
        </p>

        <div
          className="apple-continuity"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr',
            gap: 18,
            alignItems: 'end',
          }}
        >
          <div style={deviceBase} className="apple-spotlight">
            <div style={headBase}>
              <TrafficLights />
              <span
                style={{
                  fontFamily: 'var(--font-apple-mono)',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  marginLeft: 8,
                }}
              >
                api.admitly.com
              </span>
            </div>
            <div
              style={{
                padding: 22,
                fontFamily: 'var(--font-apple-mono)',
                fontSize: 12,
                color: 'var(--ink-2)',
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: 'var(--ink-3)' }}>// app/api/chat/route.ts</div>
              <div>
                <span style={{ color: 'var(--apple-accent)' }}>export async</span>{' '}
                <span style={{ color: 'var(--apple-accent)' }}>function</span> POST(req)
                {' {'}
              </div>
              <div style={{ paddingLeft: 14 }}>
                const ctx = <span style={{ color: 'var(--apple-accent)' }}>await</span>{' '}
                retrieve(query);
              </div>
              <div style={{ paddingLeft: 14 }}>
                const ans = <span style={{ color: 'var(--apple-accent)' }}>await</span>{' '}
                claude.complete(ctx);
              </div>
              <div style={{ paddingLeft: 14 }}>
                <span style={{ color: 'var(--apple-accent)' }}>return</span> stream(ans);
              </div>
              <div>{'}'}</div>
            </div>
          </div>

          <div style={deviceBase} className="apple-spotlight">
            <div style={headBase}>
              <TrafficLights />
            </div>
            <div style={{ padding: 22 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--font-apple-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Eval run · 03:24
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                92.4%
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 16 }}
              >
                factual precision · n=240
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 3,
                  height: 50,
                }}
              >
                {[34, 42, 55, 48, 78, 92, 88, 95].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      background: 'var(--apple-accent)',
                      height: `${h}%`,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={deviceBase} className="apple-spotlight">
            <div style={headBase}>
              <TrafficLights />
            </div>
            <div style={{ padding: 22 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--font-apple-mono)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Throughput
              </div>
              <div
                style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}
              >
                −54%
              </div>
              <div
                style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 12 }}
              >
                LLM cost vs. baseline
              </div>
              <svg viewBox="0 0 100 40" width="100%" height="50">
                <polyline
                  fill="none"
                  stroke="var(--apple-accent)"
                  strokeWidth="2"
                  points="0,8 14,12 28,18 42,22 56,26 70,30 84,32 100,34"
                />
                <polyline
                  fill="none"
                  stroke="var(--ink-4)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  points="0,8 14,9 28,10 42,11 56,12 70,13 84,14 100,15"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
