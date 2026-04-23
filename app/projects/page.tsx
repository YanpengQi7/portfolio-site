import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAllProjects } from '@/lib/content'
import ProjectCard from '@/components/project-card'

export default async function ProjectsPage() {
  const projects = await getAllProjects()
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-semibold text-lg">Yanpeng Qi</span>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/chat" className="hover:text-foreground transition-colors">AI Chat</Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-8 -ml-2 gap-1')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h1 className="text-4xl font-bold mb-3 mt-4">Projects</h1>
        <p className="text-muted-foreground mb-10">Things I&apos;ve built — mostly AI-powered.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </div>
    </main>
  )
}
