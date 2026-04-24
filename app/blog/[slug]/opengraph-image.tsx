import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/content'
import { OgFrame, ogContentType, ogSize } from '@/lib/og'

export const alt = 'Yanpeng Qi Blog Post'
export const size = ogSize
export const contentType = ogContentType

export default async function BlogPostOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Blog Post"
        title={post.title}
        subtitle={post.subtitle}
        accents={post.tags.slice(0, 4)}
        footerLeft={post.date}
        footerRight={post.readingTime}
      />
    ),
    {
      ...size,
    },
  )
}
