import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAllProjects } from '@/lib/content'
import ProjectCard from '@/components/project-card'

export default async function ProjectsPage() {
  const projects = await getAllProjects()

  return (
    <main className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.65 0.20 280 / 10%) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }),
          'mb-8 -ml-2 gap-1 text-muted-foreground hover:text-white')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="mb-12 animate-fade-up">
          <h1 className="text-5xl font-bold text-white mb-3">
            Projects
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered products built end-to-end.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <div key={project.slug} className={`animate-fade-up delay-${(i + 1) * 100}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
