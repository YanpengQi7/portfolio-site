'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo, useState, useSyncExternalStore } from 'react'
import { BookOpen, BriefcaseBusiness, FileText, FolderKanban, MessageSquareMore } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ProjectCard from '@/components/project-card'
import type { Project } from '@/lib/content'

const SKILLS = [
  { label: 'Java', color: 'text-amber-300' },
  { label: 'TypeScript', color: 'text-blue-400' },
  { label: 'Python', color: 'text-yellow-400' },
  { label: 'Spring Boot', color: 'text-lime-400' },
  { label: 'FastAPI', color: 'text-emerald-400' },
  { label: 'Claude AI', color: 'text-purple-400' },
  { label: 'RAG', color: 'text-cyan-400' },
  { label: 'AWS', color: 'text-orange-400' },
  { label: 'Bedrock', color: 'text-orange-300' },
  { label: 'Next.js', color: 'text-white' },
  { label: 'pgvector', color: 'text-green-400' },
  { label: 'Docker', color: 'text-sky-400' },
  { label: 'MCP', color: 'text-pink-400' },
]

const STATS = [
  { value: '5', label: 'Years as SDE' },
  { value: '1M+', label: 'Users served' },
  { value: '54%', label: 'LLM cost cut' },
  { value: '92%', label: 'RAG precision' },
]

const HERO_TECH_ORBITS = [
  { label: 'Java', className: '-top-3 left-10 text-amber-300 border-amber-300/30' },
  { label: 'Spring', className: 'top-8 -right-6 text-lime-400 border-lime-400/30' },
  { label: 'K8s', className: 'top-1/2 -right-10 -translate-y-1/2 text-sky-300 border-sky-300/30' },
  { label: 'Bedrock', className: 'bottom-8 -right-3 text-orange-400 border-orange-400/30' },
  { label: 'RAG', className: '-bottom-3 left-8 text-cyan-400 border-cyan-400/30' },
  { label: 'MCP', className: 'bottom-12 -left-8 text-pink-400 border-pink-400/30' },
  { label: 'FastAPI', className: 'top-12 -left-10 text-emerald-400 border-emerald-400/30' },
]

const INTRO_STORAGE_KEY = 'home-intro-dismissed'

const NAV_ITEMS = [
  { href: '/cv', label: 'CV', icon: FileText },
  { href: '/repositories', label: 'Repos', icon: FolderKanban },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/projects', label: 'Projects', icon: BriefcaseBusiness },
  { href: '/chat', label: 'AI Chat', icon: MessageSquareMore },
]

const VISUAL_SYSTEMS = [
  {
    src: '/generated/ai-systems-core.png',
    title: 'Production AI Core',
    label: 'RAG · Routing · Evals',
    description: 'A visual layer for how I think about grounded AI systems: retrieval, orchestration, and reliability.',
  },
  {
    src: '/generated/agent-workflow-studio.png',
    title: 'Agent Workflow Studio',
    label: 'Multi-Agent · Admissions',
    description: 'Abstracted from Admitly: task-specific agents coordinating around documents, search, and decisions.',
  },
  {
    src: '/generated/compute-selection-plane.png',
    title: 'Compute Selection Plane',
    label: 'K8s · Lambda · Fargate',
    description: 'Infrastructure as product judgment: choosing the right compute abstraction for the traffic shape.',
  },
]

export default function HomePageClient({ featured }: { featured: Project[] }) {
  const [introState, setIntroState] = useState<'visible' | 'exiting' | 'hidden'>('visible')

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const hasSeenIntro = isClient && window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true'
  const introVisible = !hasSeenIntro && (introState === 'visible' || introState === 'exiting')
  const contentVisible = hasSeenIntro || introState === 'hidden' || introState === 'exiting'

  const enterSite = () => {
    if (introState !== 'visible') return

    window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true')
    setIntroState('exiting')

    window.setTimeout(() => {
      setIntroState('hidden')
    }, 950)
  }

  const introClassName = useMemo(() => {
    if (introState === 'visible') return 'intro-overlay-visible'
    if (introState === 'exiting') return 'intro-overlay-exit'
    return 'intro-overlay-hidden'
  }, [introState])

  return (
    <>
      {introVisible && (
        <div
          className={cn('intro-overlay', introClassName)}
          onClick={enterSite}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              enterSite()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Enter Yanpeng Qi portfolio"
        >
          <div className="intro-overlay__noise" aria-hidden />
          <div className="intro-overlay__grid" aria-hidden />
          <div className="intro-overlay__spotlight" aria-hidden />

          <div className="intro-shell">
            <div className="intro-meta animate-fade-up">
              <span className="intro-meta__line" />
              <span>YANPENG QI</span>
              <span className="intro-meta__line" />
            </div>

            <button
              type="button"
              onClick={event => {
                event.stopPropagation()
                enterSite()
              }}
              className="intro-core"
              aria-label="Click to enter portfolio"
            >
              <span className="intro-core__ring intro-core__ring--outer" />
              <span className="intro-core__ring intro-core__ring--middle" />
              <span className="intro-core__ring intro-core__ring--inner" />
              <span className="intro-core__pulse" />
              <span className="intro-core__center glass">
                <span className="shimmer-text text-4xl font-semibold tracking-[0.22em]">YQ</span>
                <span className="intro-core__subtext">Click to enter</span>
              </span>
            </button>

            <div className="intro-copy animate-fade-up delay-200">
              <p className="intro-copy__eyebrow">AI Systems · Product Engineering · Full Stack</p>
              <h1 className="intro-copy__title">An engineered first impression.</h1>
              <p className="intro-copy__body">
                Built for recruiters, founders, and engineers who appreciate polished execution.
              </p>
            </div>

            <div className="intro-trace animate-fade-up delay-300">
              <span>Product Systems</span>
              <span>RAG Architect</span>
              <span>Multi-Agent Builder</span>
            </div>
          </div>
        </div>
      )}

      <main
        className={cn(
          'min-h-screen bg-background overflow-x-hidden transition-[opacity,transform,filter] duration-700',
          contentVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-md pointer-events-none',
        )}
      >
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div
            className="animate-glow animate-ambient absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 12%) 0%, transparent 70%)' }}
          />
          <div
            className="animate-glow animate-ambient delay-500 absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, oklch(0.65 0.20 280 / 10%) 0%, transparent 70%)' }}
          />
          <div
            className="animate-glow animate-ambient delay-300 absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, oklch(0.70 0.18 320 / 8%) 0%, transparent 70%)' }}
          />
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>

        <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-bold text-lg shimmer-text">YQ</span>
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-muted-foreground">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:text-white hover:border-white/15 hover:bg-white/6 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <a
                href="https://www.linkedin.com/in/yanpeng-qi/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:text-white hover:border-white/15 hover:bg-white/6 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0.5 8h4V24h-4V8zM8 8h3.83v2.19h.05C12.41 8.96 14.4 8 16.7 8 21.48 8 24 10.98 24 16.64V24h-4v-6.57c0-3.13-.06-7.16-4.36-7.16-4.37 0-5.04 3.41-5.04 6.94V24h-4V8z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://github.com/YanpengQi7"
                target="_blank"
                rel="noopener noreferrer"
                className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 hover:text-white hover:border-white/15 hover:bg-white/6 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </nav>

        <section className="relative max-w-5xl mx-auto px-6 pt-28 pb-20">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">
            <div>
              <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Software Engineer · Greater Seattle Area · Open to opportunities
              </div>

              <h1 className="animate-fade-up delay-100 text-6xl lg:text-7xl font-bold tracking-tight mb-4 leading-[1.05]">
                <span className="text-white">Yanpeng</span>
                {' '}
                <span className="gradient-text">Qi</span>
              </h1>

              <p className="animate-fade-up delay-200 text-xl text-muted-foreground mb-3 leading-relaxed max-w-xl">
                Software engineer who builds{' '}
                <span className="text-cyan-400 font-medium">production AI systems</span>
                {' '}— RAG pipelines, multi-agent orchestration, LLM integrations at scale.
              </p>
              <p className="animate-fade-up delay-300 text-muted-foreground mb-8 leading-relaxed max-w-xl">
                5 years as an SDE shipping 1M+ user products. Currently building{' '}
                <span className="text-white font-medium">Admitly</span>
                {' '}— an AI-native grad school admission copilot with hybrid search, model routing, and LLM-as-judge evals.
              </p>

              <div className="animate-fade-up delay-400 flex flex-wrap gap-2 mb-10">
                {SKILLS.map((skill, index) => (
                  <span
                    key={skill.label}
                    className={`glass px-3 py-1 rounded-full text-xs font-medium ${skill.color} hover:scale-105 transition-transform cursor-default`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {skill.label}
                  </span>
                ))}
              </div>

              <div className="animate-fade-up delay-500 flex flex-wrap gap-3">
                <a
                  href="/yanpeng-qi-resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'gap-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all',
                  )}
                >
                  Resume PDF
                </a>
                <Link
                  href="/cv"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'gap-2 border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all',
                  )}
                >
                  View CV
                </Link>
                <Link
                  href="/blog"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'gap-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all',
                  )}
                >
                  Read Blog
                </Link>
                <Link
                  href="/chat"
                  className={cn(
                    buttonVariants({ variant: 'default' }),
                    'magnetic-button gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-400/40 hover:scale-105',
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Ask me anything
                </Link>
                <a
                  href="mailto:qyanpeng1995@gmail.com"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'gap-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all',
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Get in touch
                </a>
              </div>
            </div>

            <div className="animate-float hidden lg:flex items-center justify-center">
              <div className="relative w-56 h-56">
                <div
                  className="absolute inset-0 rounded-full animate-glow"
                  style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 30%) 0%, transparent 70%)' }}
                />
                <div className="absolute inset-2 rounded-full border border-white/8" />
                <div className="absolute inset-7 rounded-full border border-white/6" />
                <div className="absolute inset-4 rounded-full glass flex items-center justify-center neon-border overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.72_0.18_210_/_0.12),transparent_60%)]" />
                  <div className="absolute inset-0 dot-bg opacity-20" />
                  <div className="text-center">
                    <div className="text-5xl mb-2">👨‍💻</div>
                    <div className="text-xs text-muted-foreground font-mono">AI Builder</div>
                  </div>
                </div>
                {HERO_TECH_ORBITS.map((item, index) => (
                  <div
                    key={item.label}
                    className={`absolute glass px-2.5 py-1 rounded-full text-[11px] font-medium border animate-fade-in delay-${Math.min(300 + index * 100, 700)} ${item.className}`}
                  >
                    {item.label}
                  </div>
                ))}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 glass px-2.5 py-1 rounded-full text-[11px] text-purple-300 border border-purple-300/30 animate-fade-in delay-500">
                  Multi-Agent
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, index) => (
              <div key={stat.label} className={`animate-fade-up delay-${(index + 3) * 100} glow-card rounded-xl p-5 text-center`}>
                <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 pb-24">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-cyan-300">
                Generated Visuals
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">AI systems, made visible.</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                A small gallery of generated visuals designed for this portfolio’s midnight and Apple-light themes.
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">OpenAI image model</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {VISUAL_SYSTEMS.map((visual, index) => (
              <article
                key={visual.title}
                className={`visual-card group animate-fade-up delay-${Math.min((index + 2) * 100, 700)} glow-card overflow-hidden rounded-[30px]`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="visual-card__halo" aria-hidden />
                  <Image
                    src={visual.src}
                    alt={`${visual.title} generated visual`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="visual-card__image object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="visual-card__scan" aria-hidden />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/12 to-transparent opacity-80" />
                  <div className="absolute left-4 top-4 glass rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                    {visual.label}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-white">{visual.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{visual.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Featured Projects</h2>
              <p className="text-sm text-muted-foreground">Things I&apos;ve built with AI at the core</p>
            </div>
            <Link
              href="/projects"
              className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1 text-muted-foreground hover:text-white group')}
            >
              View all
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {featured.map((project, index) => (
              <div key={project.slug} className={`animate-fade-up delay-${(index + 1) * 100}`}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-t border-white/5">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-cyan-400 mb-6">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Powered by Gemini 2.5 Flash + RAG
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Curious about my work?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              I trained an AI chatbot on my actual resume and projects.
              Ask it anything — it answers only from real data.
            </p>
            <Link
              href="/chat"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'magnetic-button gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-105 transition-all',
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Start a conversation
            </Link>

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

        <footer className="border-t border-white/5 py-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© 2025 Yanpeng Qi</span>
          <div className="flex items-center gap-6">
            <a href="mailto:qyanpeng1995@gmail.com" className="hover:text-white transition-colors">Email</a>
            <a href="https://www.linkedin.com/in/yanpeng-qi/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://github.com/YanpengQi7" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
          </div>
        </footer>
      </main>
    </>
  )
}
