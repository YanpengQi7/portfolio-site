import { ImageResponse } from 'next/og'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          fontSize: 52,
          lineHeight: 1,
        }}
      >
        {'\u{1F9D1}\u200D\u{1F4BB}'}
      </div>
    ),
    {
      ...size,
    },
  )
}
