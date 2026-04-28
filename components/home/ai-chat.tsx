import Link from 'next/link'

export default function AIChat() {
  return (
    <section
      id="chat"
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
          Try it now
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
          Ask my AI anything about my work.
        </h2>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.42,
            color: 'var(--ink-2)',
            textAlign: 'center',
            maxWidth: 640,
            margin: '0 auto 32px',
            letterSpacing: '-0.01em',
          }}
        >
          Trained on real resume + projects. It only answers from real data.
        </p>

        <div
          className="apple-spotlight"
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--r-lg)',
            border: '0.5px solid var(--rule)',
            padding: 28,
            maxWidth: 720,
            margin: '0 auto',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingBottom: 16,
              borderBottom: '0.5px solid var(--rule)',
              marginBottom: 18,
              color: 'var(--ink-3)',
              fontFamily: 'var(--font-apple-mono)',
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#34c759',
                display: 'inline-block',
              }}
            />
            <span>chat.tsx</span>
            <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
              Powered by Gemini 2.5 Flash + RAG
            </span>
          </div>
          {[
            { who: 'you', body: 'How does the RAG pipeline in Admitly work?' },
            {
              who: 'ai',
              body: (
                <>
                  Hybrid search: <code>BM25</code> for keyword precision,{' '}
                  <code>pgvector</code> for dense embeddings, <code>RRF</code> re-ranking
                  on top. Achieves <b>92%</b> factual precision on the eval set.
                </>
              ),
            },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span
                style={{
                  fontFamily: 'var(--font-apple-mono)',
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  width: 28,
                  flex: 'none',
                  marginTop: 4,
                }}
              >
                {m.who}
              </span>
              <div
                style={{
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  flex: 1,
                }}
              >
                {m.body}
              </div>
            </div>
          ))}
          <Link
            href="/chat"
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 999,
              background: 'var(--bg-section)',
              color: 'var(--ink-3)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            <span>Open chat</span>
            <span style={{ marginLeft: 'auto', color: 'var(--apple-accent)' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
