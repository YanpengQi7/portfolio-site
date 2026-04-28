const STATS = [
  { num: '7', suffix: '+', label: 'Years building software' },
  { num: '12', suffix: '', label: 'AI projects shipped' },
  { num: '100M', suffix: '+', label: 'Requests served' },
  { num: '1', suffix: '', label: 'Engineer, end-to-end' },
]

export default function StatsBar() {
  return (
    <section
      style={{
        padding: '0 22px',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '0.5px solid var(--rule)',
          borderBottom: '0.5px solid var(--rule)',
        }}
        className="apple-stats-grid"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              borderRight:
                i < STATS.length - 1 ? '0.5px solid var(--rule)' : 'none',
            }}
            className="apple-stat-cell"
          >
            <div
              style={{
                fontSize: 'clamp(40px, 5vw, 56px)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: 'var(--ink)',
              }}
            >
              {s.num}
              {s.suffix && (
                <span style={{ color: 'var(--apple-accent)' }}>{s.suffix}</span>
              )}
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: 'var(--font-apple-mono)',
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
