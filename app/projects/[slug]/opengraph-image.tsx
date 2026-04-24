import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { getProject } from '@/lib/content'
import { OgFrame, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Yanpeng Qi Project'
export const size = ogSize
export const contentType = ogContentType

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Project"
        title={project.title}
        subtitle={project.subtitle}
        accents={project.tech.slice(0, 5)}
        footerLeft={String(project.year)}
        footerRight={project.status}
      />
    ),
    {
      ...size,
    },
  )
}
