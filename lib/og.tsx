type OgFrameProps = {
  eyebrow: string
  title: string
  subtitle: string
  accents?: string[]
  footerLeft?: string
  footerRight?: string
}

export const ogSize = {
  width: 1200,
  height: 630,
}

export const ogContentType = 'image/png'

export function OgFrame({
  eyebrow,
  title,
  subtitle,
  accents = [],
  footerLeft = 'yanpengqi.com',
  footerRight = 'AI Builder · SDE',
}: OgFrameProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(circle at top left, rgba(73, 203, 255, 0.22), transparent 32%), radial-gradient(circle at top right, rgba(150, 110, 255, 0.18), transparent 28%), linear-gradient(180deg, #090a0d 0%, #06070a 100%)',
        color: '#f5f7fb',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 24,
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '44px 48px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 22,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#7dd9ff',
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                background: '#57d36f',
                display: 'flex',
              }}
            />
            {eyebrow}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              maxWidth: 920,
            }}
          >
            <div
              style={{
                fontSize: title.length > 50 ? 62 : 72,
                lineHeight: 1.06,
                fontWeight: 700,
                letterSpacing: '-0.045em',
                display: 'flex',
                textWrap: 'balance',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.45,
                color: 'rgba(240,244,252,0.72)',
                display: 'flex',
                maxWidth: 960,
                textWrap: 'balance',
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, maxWidth: 760 }}>
            {accents.map(accent => (
              <div
                key={accent}
                style={{
                  display: 'flex',
                  borderRadius: 9999,
                  border: '1px solid rgba(125,217,255,0.22)',
                  background: 'rgba(125,217,255,0.08)',
                  padding: '12px 18px',
                  fontSize: 21,
                  color: '#d8f5ff',
                }}
              >
                {accent}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 8,
              fontSize: 22,
              color: 'rgba(240,244,252,0.58)',
            }}
          >
            <div style={{ display: 'flex', fontWeight: 600, color: '#f5f7fb' }}>{footerLeft}</div>
            <div style={{ display: 'flex' }}>{footerRight}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
