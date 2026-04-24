import { ImageResponse } from 'next/og'
import { OgFrame, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Yanpeng Qi — AI Builder & SDE'
export const size = ogSize
export const contentType = ogContentType

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Portfolio"
        title="Yanpeng Qi"
        subtitle="Software engineer building production AI systems, RAG pipelines, multi-agent workflows, and practical product experiences."
        accents={['RAG', 'Multi-Agent', 'AWS', 'Next.js', 'Admitly']}
      />
    ),
    {
      ...size,
    },
  )
}
