import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getProject, getAllProjects } from '@/lib/content'

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <span className="font-semibold text-lg">Yanpeng Qi</span>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <Link href="/chat" className="hover:text-foreground transition-colors">AI Chat</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/projects" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-8 -ml-2 gap-1')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All Projects
        </Link>
        <div className="mb-2 flex items-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground">{project.year}</span>
          <span className="text-muted-foreground">·</span>
          <span className={`text-sm font-medium ${project.status === 'In Development' ? 'text-green-600' : 'text-muted-foreground'}`}>
            {project.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
        <p className="text-xl text-muted-foreground mb-6">{project.subtitle}</p>
        <div className="flex flex-wrap gap-2 mb-10">
          {project.tech.map((t: string) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: project.contentHtml }}
        />
      </div>
    </main>
  )
}
