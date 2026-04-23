import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAllProjects } from '@/lib/content'
import ProjectCard from '@/components/project-card'

const SKILLS = [
  { label: 'TypeScript', color: 'text-blue-400' },
  { label: 'Python', color: 'text-yellow-400' },
  { label: 'Claude AI', color: 'text-purple-400' },
  { label: 'RAG', color: 'text-cyan-400' },
  { label: 'AWS', color: 'text-orange-400' },
  { label: 'Next.js', color: 'text-white' },
  { label: 'pgvector', color: 'text-green-400' },
  { label: 'MCP', color: 'text-pink-400' },
]

const STATS = [
  { value: '4+', label: 'Years at Amazon' },
  { value: '1M+', label: 'Users served' },
  { value: '54%', label: 'LLM cost cut' },
  { value: '92%', label: 'RAG precision' },
]

export default async function HomePage() {
  const projects = await getAllProjects()
  const featured = projects.filter(p => p.featured)

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="animate-glow absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 12%) 0%, transparent 70%)' }} />
        <div className="animate-glow delay-500 absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.65 0.20 280 / 10%) 0%, transparent 70%)' }} />
        <div className="animate-glow delay-300 absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.70 0.18 320 / 8%) 0%, transparent 70%)' }} />
        {/* Grid */}
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg shimmer-text">YQ</span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
            <a href="https://github.com/YanpengQi7" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-5xl mx-auto px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            {/* Status pill */}
            <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              SDE @ Amazon · Bellevue, WA · Open to opportunities
            </div>

            {/* Name */}
            <h1 className="animate-fade-up delay-100 text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-[1.05]">
              <span className="text-white">Yanpeng</span>
              <br />
              <span className="gradient-text">Qi</span>
            </h1>

            {/* Tagline */}
            <p className="animate-fade-up delay-200 text-xl text-muted-foreground mb-3 leading-relaxed max-w-xl">
              Software engineer who builds{' '}
              <span className="text-cyan-400 font-medium">production AI systems</span>
              {' '}— RAG pipelines, multi-agent orchestration, LLM integrations at scale.
            </p>
            <p className="animate-fade-up delay-300 text-muted-foreground mb-8 leading-relaxed max-w-xl">
              4+ years at Amazon shipping 1M+ user products. Currently building{' '}
              <span className="text-white font-medium">Admitly</span>
              {' '}— an AI-native grad school admission copilot with hybrid search, model routing, and LLM-as-judge evals.
            </p>

            {/* Skill badges */}
            <div className="animate-fade-up delay-400 flex flex-wrap gap-2 mb-10">
              {SKILLS.map((s, i) => (
                <span key={s.label}
                  className={`glass px-3 py-1 rounded-full text-xs font-medium ${s.color} hover:scale-105 transition-transform cursor-default`}
                  style={{ animationDelay: `${i * 50}ms` }}>
                  {s.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="animate-fade-up delay-500 flex flex-wrap gap-3">
              <Link href="/chat"
                className={cn(buttonVariants({ variant: 'default' }),
                  'gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-400/40 hover:scale-105')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Ask me anything
              </Link>
              <a href="mailto:qyanpeng1995@gmail.com"
                className={cn(buttonVariants({ variant: 'outline' }),
                  'gap-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Get in touch
              </a>
            </div>
          </div>

          {/* Avatar / visual */}
          <div className="animate-float hidden lg:flex items-center justify-center">
            <div className="relative w-56 h-56">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full animate-glow"
                style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 30%) 0%, transparent 70%)' }} />
              {/* Inner circle */}
              <div className="absolute inset-4 rounded-full glass flex items-center justify-center neon-border">
                <div className="text-center">
                  <div className="text-5xl mb-2">👨‍💻</div>
                  <div className="text-xs text-muted-foreground font-mono">AI Builder</div>
                </div>
              </div>
              {/* Orbiting badges */}
              <div className="absolute -top-2 -right-2 glass px-2 py-1 rounded-full text-xs text-cyan-400 border border-cyan-400/30 animate-fade-in delay-600">
                ⚡ RAG
              </div>
              <div className="absolute -bottom-2 -left-4 glass px-2 py-1 rounded-full text-xs text-purple-400 border border-purple-400/30 animate-fade-in delay-700">
                🤖 Multi-Agent
              </div>
              <div className="absolute top-1/2 -right-8 glass px-2 py-1 rounded-full text-xs text-green-400 border border-green-400/30 animate-fade-in delay-500">
                ☁️ AWS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={s.label}
              className={`animate-fade-up delay-${(i + 3) * 100} glow-card rounded-xl p-5 text-center`}>
              <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Featured Projects</h2>
            <p className="text-sm text-muted-foreground">Things I&apos;ve built with AI at the core</p>
          </div>
          <Link href="/projects"
            className={cn(buttonVariants({ variant: 'ghost' }),
              'gap-1 text-muted-foreground hover:text-white group')}>
            View all
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {featured.map((project, i) => (
            <div key={project.slug} className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </section>

      {/* ── AI Chat CTA ── */}
      <section className="relative border-t border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-cyan-400 mb-6">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            Powered by Gemini 2.5 Flash + RAG
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Curious about my work?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            I trained an AI chatbot on my actual resume and projects.
            Ask it anything — it answers only from real data.
          </p>
          <Link href="/chat"
            className={cn(buttonVariants({ size: 'lg' }),
              'gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 transition-all')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start a conversation
          </Link>

          {/* Terminal-style preview */}
          <div className="mt-10 glass rounded-xl p-5 text-left max-w-lg mx-auto border border-white/5">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">chat.tsx</span>
            </div>
            <div className="space-y-3 text-sm font-mono">
              <div className="flex gap-3">
                <span className="text-muted-foreground shrink-0">you</span>
                <span className="text-white">How does the RAG pipeline in Admitly work?</span>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-400 shrink-0">ai·</span>
                <span className="text-muted-foreground leading-relaxed">
                  Hybrid search: BM25 for keyword precision + pgvector dense embeddings + RRF re-ranking.
                  Achieves <span className="text-green-400">92% factual precision</span>...
                  <span className="inline-block w-1.5 h-4 bg-cyan-400 ml-0.5 align-middle animate-pulse" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2025 Yanpeng Qi</span>
          <div className="flex items-center gap-6">
            <a href="mailto:qyanpeng1995@gmail.com" className="hover:text-white transition-colors">Email</a>
            <a href="https://github.com/YanpengQi7" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">GitHub</a>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </footer>

    </main>
  )
}
