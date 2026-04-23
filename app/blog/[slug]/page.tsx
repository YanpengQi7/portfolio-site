import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBlogPosts, getBlogPost } from '@/lib/content'

export async function generateStaticParams() {
  const posts = await getAllBlogPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[620px] h-[420px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 9%) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 dot-bg opacity-15" />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/repositories" className="hover:text-white transition-colors">Repositories</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        <article className="glow-card rounded-[32px] p-6 md:p-8 lg:p-10 animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-5">
            <span>{post.date}</span>
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span>{post.readingTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground leading-8 mb-6">{post.subtitle}</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags.map(tag => (
              <span key={tag} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-cyan-200">
                {tag}
              </span>
            ))}
          </div>

          <div
            className="prose-custom"
            style={{ color: 'oklch(0.8 0 0)' }}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </div>
    </main>
  )
}
