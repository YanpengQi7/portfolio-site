import Link from 'next/link'
import type { Project } from '@/lib/content'

const cardBase: React.CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: 'var(--r-xl)',
  padding: 32,
  border: '0.5px solid var(--rule)',
  boxShadow: 'var(--shadow-card)',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 360,
  fontFamily: 'var(--font-apple-sans)',
}

function Card({ project }: { project: Project }) {
  return (
    <article className="apple-tile apple-spotlight" style={cardBase}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: 'var(--ink-3)',
          marginBottom: 14,
          fontFamily: 'var(--font-apple-mono)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {project.status === 'In Development' && (
          <span
            style={{
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: 11,
              background: 'rgba(48,209,88,.12)',
              color: '#1d8a4e',
              border: '0.5px solid rgba(48,209,88,.25)',
            }}
          >
            Live
          </span>
        )}
        <span>{project.year}</span>
      </div>
      <h3
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          margin: '0 0 8px',
          color: 'var(--ink)',
        }}
      >
        {project.title}
      </h3>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          color: 'var(--ink-2)',
          margin: '0 0 18px',
          letterSpacing: '-0.005em',
        }}
      >
        {project.subtitle}
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 'auto',
        }}
      >
        {project.tech.slice(0, 5).map(t => (
          <span
            key={t}
            style={{
              fontSize: 11,
              padding: '3px 9px',
              borderRadius: 999,
              border: '0.5px solid var(--rule)',
              background: 'var(--bg-section)',
              color: 'var(--ink-2)',
              fontFamily: 'var(--font-apple-mono)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
        <Link
          href={`/projects/${project.slug}`}
          style={{
            padding: '8px 18px',
            borderRadius: 999,
            background: 'var(--apple-accent)',
            color: 'white',
            fontSize: 13,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Case study
        </Link>
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 18px',
              borderRadius: 999,
              background: 'var(--bg-section)',
              color: 'var(--ink)',
              fontSize: 13,
              fontWeight: 500,
              border: '0.5px solid var(--rule)',
              textDecoration: 'none',
            }}
          >
            Live demo
          </a>
        )}
      </div>
    </article>
  )
}

export default function ProjectCards({ featured }: { featured: Project[] }) {
  return (
    <section
      id="projects"
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
          Featured Projects
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
          Things I&apos;ve built with AI at the core.
        </h2>
        <div
          className="apple-project-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
        >
          {featured.map(p => (
            <Card key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
