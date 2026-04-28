import Link from 'next/link'

const linkStyle: React.CSSProperties = {
  color: 'var(--ink-2)',
  textDecoration: 'none',
}

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-section)',
        color: 'var(--ink-3)',
        padding: '64px 22px 40px',
        fontSize: 13,
        lineHeight: 1.6,
        borderTop: '0.5px solid var(--rule)',
        fontFamily: 'var(--font-apple-sans)',
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div
          className="apple-foot-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            paddingBottom: 36,
            borderBottom: '0.5px solid var(--rule)',
          }}
        >
          <div>
            <h4
              style={{
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                margin: '0 0 12px',
                fontFamily: 'var(--font-apple-mono)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Yanpeng Qi
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Software Engineer</li>
              <li>Greater Seattle</li>
              <li>Open to opportunities</li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                margin: '0 0 12px',
                fontFamily: 'var(--font-apple-mono)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Site
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><Link href="/#work" style={linkStyle}>Work</Link></li>
              <li><Link href="/cv" style={linkStyle}>CV</Link></li>
              <li><Link href="/blog" style={linkStyle}>Writing</Link></li>
              <li><Link href="/repositories" style={linkStyle}>Repos</Link></li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                margin: '0 0 12px',
                fontFamily: 'var(--font-apple-mono)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Build
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><Link href="/chat" style={linkStyle}>AI Chat</Link></li>
              <li><a href="https://yanpengqi.com/yanpeng-qi-resume.pdf" style={linkStyle}>Resume PDF</a></li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                margin: '0 0 12px',
                fontFamily: 'var(--font-apple-mono)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Connect
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><a href="mailto:qyanpeng1995@gmail.com" style={linkStyle}>Email</a></li>
              <li><a href="https://www.linkedin.com/in/yanpeng-qi/" style={linkStyle}>LinkedIn</a></li>
              <li><a href="https://github.com/YanpengQi7" style={linkStyle}>GitHub</a></li>
            </ul>
          </div>
        </div>
        <div
          style={{
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
          }}
        >
          <span>© 2026 Yanpeng Qi. Designed &amp; engineered by hand.</span>
          <span>Apple Light</span>
        </div>
      </div>
    </footer>
  )
}
