import Link from 'next/link'
import { Project } from '@/lib/content'

// Unique gradient + icon per project
const PROJECT_VISUALS: Record<string, { gradient: string; icon: string; accent: string }> = {
  admitly: {
    gradient: 'from-cyan-500/20 via-blue-600/10 to-purple-600/20',
    icon: '🎓',
    accent: 'text-cyan-400 border-cyan-400/30',
  },
  'ai-financial-agent': {
    gradient: 'from-green-500/20 via-emerald-600/10 to-teal-600/20',
    icon: '📈',
    accent: 'text-green-400 border-green-400/30',
  },
  'auto-apply-extension': {
    gradient: 'from-orange-500/20 via-amber-600/10 to-yellow-600/20',
    icon: '⚡',
    accent: 'text-orange-400 border-orange-400/30',
  },
  'study-abroad-platform': {
    gradient: 'from-purple-500/20 via-violet-600/10 to-pink-600/20',
    icon: '🌏',
    accent: 'text-purple-400 border-purple-400/30',
  },
}

const DEFAULT_VISUAL = {
  gradient: 'from-slate-500/20 via-slate-600/10 to-slate-700/20',
  icon: '🛠',
  accent: 'text-slate-400 border-slate-400/30',
}

export default function ProjectCard({ project }: { project: Project }) {
  const visual = PROJECT_VISUALS[project.slug] ?? DEFAULT_VISUAL

  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <div className="glow-card rounded-2xl overflow-hidden h-full flex flex-col">

        {/* Visual header */}
        <div className={`relative h-36 bg-gradient-to-br ${visual.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 dot-bg opacity-30" />
          <div className="relative text-5xl group-hover:scale-110 transition-transform duration-300">
            {visual.icon}
          </div>
          {project.status === 'In Development' && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 glass px-2 py-1 rounded-full text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live
            </div>
          )}
          <div className="absolute top-3 left-3 glass px-2 py-1 rounded-full text-xs text-muted-foreground">
            {project.year}
          </div>
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <div className="glass rounded-full p-1.5">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
            {project.subtitle}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 4).map(t => (
              <span key={t}
                className={`text-xs px-2 py-0.5 rounded-full glass border ${visual.accent}`}>
                {t}
              </span>
            ))}
            {project.tech.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-muted-foreground">
                +{project.tech.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
