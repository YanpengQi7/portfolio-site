import Link from 'next/link'
import ViewTransitionLink from '@/components/view-transition-link'
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
    <div className="group h-full visual-card">
      <div className="glow-card rounded-2xl overflow-hidden h-full flex flex-col">

        {/* Visual header */}
        <div className={`relative h-36 bg-gradient-to-br ${visual.gradient} flex items-center justify-center overflow-hidden`}>
          <div className="visual-card__halo" aria-hidden />
          <div className="absolute inset-0 dot-bg opacity-30" />
          <div className="visual-card__scan" aria-hidden />
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
          <ViewTransitionLink
            href={`/projects/${project.slug}`}
            transitionName={`project-title-${project.slug}`}
            className="block"
          >
            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
              {project.title}
            </h3>
          </ViewTransitionLink>
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

          <div className="mt-5 flex flex-wrap gap-2">
            <ViewTransitionLink
              href={`/projects/${project.slug}`}
              className="magnetic-button inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-white hover:border-white/20 hover:bg-white/7 transition-all"
            >
              Case Study
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </ViewTransitionLink>

            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="magnetic-button inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/12 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-400/18 hover:border-cyan-300/40 transition-all"
              >
                Live Demo
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
