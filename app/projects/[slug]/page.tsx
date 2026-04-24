import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import ReadingProgress from '@/components/reading-progress'
import { cn } from '@/lib/utils'
import { getProject, getAllProjects } from '@/lib/content'

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) {
    return {}
  }

  return {
    title: `${project.title} — Yanpeng Qi`,
    description: project.subtitle,
    openGraph: {
      title: project.title,
      description: project.subtitle,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.subtitle,
    },
  }
}

const ACCENT_MAP: Record<string, string> = {
  admitly: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  'ai-financial-agent': 'text-green-400 border-green-400/30 bg-green-400/10',
  'auto-apply-extension': 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  'study-abroad-platform': 'text-purple-400 border-purple-400/30 bg-purple-400/10',
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const accent = ACCENT_MAP[slug] ?? 'text-slate-400 border-slate-400/30 bg-slate-400/10'

  return (
    <main className="min-h-screen bg-background">
      <ReadingProgress />
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 8%) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 dot-bg opacity-20" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <Link href="/projects"
          className={cn(buttonVariants({ variant: 'ghost' }),
            'mb-8 -ml-2 gap-1 text-muted-foreground hover:text-white')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Projects
        </Link>

        {/* Header */}
        <div className="animate-fade-up mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-muted-foreground font-mono">{project.year}</span>
            {project.status === 'In Development' && (
              <span className="flex items-center gap-1.5 text-xs text-green-400 glass px-2 py-1 rounded-full border border-green-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                In Development
              </span>
            )}
          </div>
          <h1
            className="text-4xl font-bold text-white mb-3"
            style={{ viewTransitionName: `project-title-${slug}` }}
          >
            {project.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">{project.subtitle}</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20',
                )}
              >
                Live Demo
              </a>
            )}
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'border-white/10 hover:border-white/30 hover:bg-white/5',
              )}
            >
              Ask About This Project
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((t: string) => (
              <span key={t}
                className={`text-xs px-2.5 py-1 rounded-full border glass ${accent}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

        {/* Content */}
        <div
          className="animate-fade-up delay-200 prose-custom"
          style={{ color: 'oklch(0.80 0 0)' }}
          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
        />
      </div>
    </main>
  )
}
