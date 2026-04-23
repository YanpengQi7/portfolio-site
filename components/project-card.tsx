import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight } from 'lucide-react'
import { Project } from '@/lib/content'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="rounded-xl border border-border p-6 hover:border-primary/50 hover:bg-muted/30 transition-all h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-xs text-muted-foreground">{project.year}</span>
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
        </div>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.subtitle}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tech.slice(0, 4).map(t => (
            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
          ))}
          {project.tech.length > 4 && (
            <Badge variant="outline" className="text-xs">+{project.tech.length - 4}</Badge>
          )}
        </div>
        {project.status === 'In Development' && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-green-600 font-medium">In Development</span>
          </div>
        )}
      </div>
    </Link>
  )
}
