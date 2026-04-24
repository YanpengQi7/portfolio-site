import { ImageResponse } from 'next/og'
import { OgFrame, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Yanpeng Qi Blog'
export const size = ogSize
export const contentType = ogContentType

export default function BlogOpenGraphImage() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Blog"
        title="Notes on building real AI systems."
        subtitle="Writing about retrieval quality, model routing, agent evaluation, AWS tradeoffs, and product-minded engineering."
        accents={['RAG', 'Evals', 'Routing', 'Infra', 'System Design']}
        footerRight="yanpengqi.com/blog"
      />
    ),
    {
      ...size,
    },
  )
}
