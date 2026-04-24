import { ImageResponse } from 'next/og'
import { OgFrame, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Yanpeng Qi Projects'
export const size = ogSize
export const contentType = ogContentType

export default function ProjectsOpenGraphImage() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Projects"
        title="AI-powered products built end-to-end."
        subtitle="A portfolio of production-minded product work across agents, admissions, finance, automation, and retrieval."
        accents={['Admitly', 'Agents', 'RAG', 'Bedrock', 'Full Stack']}
        footerRight="yanpengqi.com/projects"
      />
    ),
    {
      ...size,
    },
  )
}
