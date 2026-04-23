import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/content'

export const metadata = {
  title: 'Yanpeng Qi — Blog',
  description: 'Technical writing on RAG, model routing, agent systems, and product-minded engineering.',
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()

  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 right-0 w-[520px] h-[520px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 10%) 0%, transparent 72%)' }}
        />
        <div className="absolute inset-0 dot-bg opacity-20" />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/cv" className="hover:text-white transition-colors">CV</Link>
            <Link href="/repositories" className="hover:text-white transition-colors">Repositories</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-300 mb-5">
            Blog
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Notes on building real AI systems.</h1>
          <p className="max-w-3xl text-lg text-muted-foreground leading-8">
            Writing about retrieval quality, model routing, agent evaluation, and the product decisions behind production-grade AI work.
          </p>
        </div>

        <div className="grid gap-5">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className={`animate-fade-up delay-${Math.min((index + 1) * 100, 700)} glow-card rounded-[28px] p-6 md:p-7 block group`}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                <span>{post.date}</span>
                <span className="h-1 w-1 rounded-full bg-white/25" />
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-7 mb-5">{post.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-cyan-200">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
