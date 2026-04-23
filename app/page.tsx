import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAllProjects } from '@/lib/content'
import ProjectCard from '@/components/project-card'

export default async function HomePage() {
  const projects = await getAllProjects()
  const featured = projects.filter(p => p.featured)

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-semibold text-lg">Yanpeng Qi</span>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <Link href="/chat" className="hover:text-foreground transition-colors">AI Chat</Link>
          <a href="https://github.com/YanpengQi7" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">SDE @ Amazon · Bellevue, WA</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Hi, I&apos;m Yanpeng
          </h1>
          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            Software Development Engineer at Amazon. I build production AI systems — RAG pipelines, multi-agent orchestration, and LLM integrations at scale.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            At Amazon I&apos;ve shipped RAG + MCP-powered internal tools, re-architected a 1M+ user platform, and integrated AI code review into CI/CD with Bedrock. On the side I&apos;m building <strong className="text-foreground">Admitly</strong> — an AI-native grad school admission copilot with hybrid search, model routing, and LLM-as-judge evals.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['TypeScript', 'Python', 'Claude AI', 'RAG', 'AWS', 'Next.js', 'pgvector', 'MCP'].map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/chat" className={cn(buttonVariants({ variant: 'default' }), 'gap-2')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Ask me anything
            </Link>
            <a href="mailto:qyanpeng1995@gmail.com" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email me
            </a>
            <a href="https://github.com/YanpengQi7" target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1')}>
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featured.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* AI Chat CTA */}
      <section className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold mb-3">Have questions about my work?</h2>
          <p className="text-muted-foreground mb-6">
            I built an AI chatbot trained on my resume and projects. Ask it anything.
          </p>
          <Link href="/chat" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'gap-2')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  )
}
