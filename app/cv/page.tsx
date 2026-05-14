import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const IMPACT_METRICS = [
  { value: '5', label: 'Years building production systems' },
  { value: '1M+', label: 'Users supported at scale' },
  { value: '54%', label: 'LLM cost reduction' },
  { value: '92%', label: 'RAG factual precision' },
]

const CORE_STACK = [
  'Java',
  'Python',
  'TypeScript',
  'React',
  'Next.js',
  'Spring Boot',
  'FastAPI',
  'AWS',
  'Kubernetes',
  'Bedrock',
  'RAG',
  'pgvector',
  'Docker',
]

const EXPERIENCE = [
  {
    role: 'Software Development Engineer',
    company: 'Large-Scale Consumer Platform',
    location: 'Greater Seattle Area',
    period: '2021 — Present',
    teams: [
      {
        name: 'Consumer Experience Platform',
        summary: 'Led engineering on a 1M+ user product serving roughly 1,000 TPS during peak.',
        bullets: [
          'Built a Python forecasting pipeline that extracted endpoints, pulled traffic history from internal observability systems, and modeled TPS growth, cutting a four-month capacity planning process down to two months.',
          'Drove a platform migration with percentage rollouts and URL-based state handoff, eliminating full page reloads and improving average page load latency by 40%.',
          'Re-architected the experience from a legacy server-rendered UI stack to React + Spring Boot and introduced a config-driven rule engine so new device flows could launch through JSON configuration instead of core code changes.',
          'Built an internal AI knowledge assistant using RAG and a custom MCP server, helping unblock onboarding and mentoring two interns through faster ramp-up.',
        ],
      },
      {
        name: 'Identity and Platform Services',
        summary: 'Worked on identity-aware backend systems and AI-assisted developer workflows.',
        bullets: [
          'Built an identity-aware microservice on AWS Fargate for automated membership validation with secure cross-account isolation.',
          'Led a cross-region migration for a Redis-backed device-awareness workload in EU infrastructure, writing the migration plan, provisioning the destination Lambda + Redis stack ahead of time, and coordinating phased traffic movement.',
          'Used VPC peering, async dual-writes, and a one-day TTL overlap window to keep Redis state aligned across both regions, avoid meaningful latency regressions, and eliminate cold-start or cache-consistency issues during cutover.',
          'Integrated an AI code review assistant into CI/CD with AWS Lambda and a managed cloud LLM platform, reducing manual review cycles by 25% through tiered prompt design.',
          'Deployed an async job orchestration system for large-scale metadata sync with proactive CloudWatch alerting for authentication anomalies.',
        ],
      },
    ],
  },
]

const PROJECTS = [
  {
    title: 'Admitly',
    period: '2025',
    accent: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/8',
    bullets: [
      'Orchestrated 16 task-tagged AI operations across four agent pipelines, including a 12-step deep research flow and a five-stage essay coaching system.',
      'Built a hybrid RAG pipeline with semantic chunking, pgvector search, BM25, and reciprocal rank fusion, reaching 92% factual precision.',
      'Implemented model routing across Opus, Sonnet, and Haiku to reduce per-pipeline LLM cost by 54%.',
    ],
  },
  {
    title: 'AI Financial Intelligence Agent',
    period: '2024',
    accent: 'text-green-400 border-green-400/20 bg-green-400/8',
    bullets: [
      'Engineered a multi-tool reasoning agent using Claude function calling to chain five tools across news, filings, pricing, technicals, and sentiment.',
      'Delivered structured investment signals with cited sources in under three seconds while processing 500+ articles per day.',
      'Built an embedding-based clustering pipeline and few-shot sentiment classifier that reduced false positives by 45% and reached 79% precision on high-impact events.',
    ],
  },
]

const EDUCATION = [
  {
    school: 'University of Pennsylvania',
    degree: 'M.S. in Computer and Information Technology',
    location: 'Philadelphia, PA',
    period: 'Aug 2018 — Dec 2020',
  },
  {
    school: 'Sun Yat-Sen University',
    degree: 'B.S. in Material Physics',
    location: 'Guangzhou, China',
    period: 'Aug 2013 — May 2017',
  },
]

const SKILL_GROUPS = [
  {
    title: 'AI Systems',
    items: [
      'RAG pipelines',
      'Multi-agent orchestration',
      'Claude API',
      'Managed LLM platforms',
      'Prompt engineering',
      'LLM evals',
      'MCP servers',
      'Embedding retrieval',
    ],
  },
  {
    title: 'Application Engineering',
    items: [
      'React',
      'Next.js App Router',
      'React Native',
      'TypeScript',
      'Java',
      'Spring Boot',
      'Node.js',
      'FastAPI',
    ],
  },
  {
    title: 'Data & Infra',
    items: [
      'PostgreSQL',
      'pgvector',
      'MongoDB',
      'DynamoDB',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS Lambda',
      'ECS/Fargate',
      'CloudWatch',
      'GitHub Actions',
    ],
  },
]

export const metadata = {
  title: 'Yanpeng Qi — CV',
  description: 'Experience, projects, education, and technical strengths for Yanpeng Qi.',
}

const RESUME_PDF_PATH = '/yanpeng-qi-resume.pdf'

export default function CvPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 10%) 0%, transparent 72%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.70 0.18 320 / 8%) 0%, transparent 70%)' }}
        />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-10 lg:py-14">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'ghost' }), 'gap-1 -ml-2 text-muted-foreground hover:text-white')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="glass rounded-full px-3 py-1 text-xs tracking-[0.24em] uppercase text-cyan-300">
            Curriculum Vitae
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-8 self-start space-y-5">
            <section className="glow-card rounded-[28px] p-6 lg:p-7 animate-fade-up">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Available for strong teams
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white leading-[0.95] mb-3">
                Yanpeng
                <br />
                <span className="gradient-text">Qi</span>
              </h1>
              <p className="text-sm text-cyan-300 tracking-[0.18em] uppercase mb-5">
                Software Engineer · AI Builder
              </p>
              <p className="text-sm leading-7 text-muted-foreground mb-6">
                I build production-grade AI systems with strong product sense: retrieval, orchestration, model routing, full-stack delivery, and the infrastructure discipline needed to run them reliably.
              </p>

              <div className="space-y-3 text-sm">
                <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Location</div>
                  <div className="text-white">Greater Seattle Area</div>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">Email</div>
                  <a href="mailto:qyanpeng1995@gmail.com" className="text-white hover:text-cyan-300 transition-colors">
                    qyanpeng1995@gmail.com
                  </a>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">GitHub</div>
                  <a
                    href="https://github.com/YanpengQi7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-300 transition-colors"
                  >
                    github.com/YanpengQi7
                  </a>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">LinkedIn</div>
                  <a
                    href="https://www.linkedin.com/in/yanpeng-qi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-cyan-300 transition-colors"
                  >
                    linkedin.com/in/yanpeng-qi
                  </a>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={RESUME_PDF_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: 'sm' }),
                    'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20',
                  )}
                >
                  Open PDF
                </a>
                <a
                  href={RESUME_PDF_PATH}
                  download
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'border-white/10 hover:border-white/30 hover:bg-white/5',
                  )}
                >
                  Download Resume
                </a>
              </div>
            </section>

            <section className="glow-card rounded-[28px] p-6 animate-fade-up delay-100">
              <div className="mb-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">Core Stack</div>
              <div className="flex flex-wrap gap-2">
                {CORE_STACK.map((item) => (
                  <span key={item} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-white">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-8">
            <section className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Overview</div>
                  <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">
                    Built for signal, not noise.
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground">
                  Five years of software engineering experience across consumer-scale systems, AI tooling, production delivery, and platform-minded backend work. I care about architectures that are measurable, grounded, and operationally realistic.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {IMPACT_METRICS.map((metric, index) => (
                  <div key={metric.label} className={`rounded-[24px] border border-white/8 bg-white/4 p-5 animate-fade-up delay-${(index + 1) * 100}`}>
                    <div className="text-3xl font-semibold gradient-text mb-2">{metric.value}</div>
                    <div className="text-sm text-muted-foreground leading-6">{metric.label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up delay-100">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Experience</div>
                <h2 className="text-2xl font-semibold text-white">Professional Experience</h2>
              </div>

              <div className="space-y-8">
                {EXPERIENCE.map((job) => (
                  <div key={`${job.company}-${job.role}`} className="space-y-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{job.role}</h3>
                        <p className="text-sm text-cyan-300">{job.company} · {job.location}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{job.period}</div>
                    </div>

                    <div className="space-y-5">
                      {job.teams.map((team) => (
                        <div key={team.name} className="rounded-[24px] border border-white/8 bg-white/3 p-5">
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-cyan-400" />
                            <h4 className="text-base font-medium text-white">{team.name}</h4>
                          </div>
                          <p className="text-sm leading-7 text-muted-foreground mb-4">{team.summary}</p>
                          <ul className="space-y-3 text-sm leading-7 text-foreground/90">
                            {team.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/90" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up delay-200">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Projects</div>
                <h2 className="text-2xl font-semibold text-white">Selected Work</h2>
              </div>

              <div className="grid gap-4">
                {PROJECTS.map((project) => (
                  <div key={project.title} className="rounded-[24px] border border-white/8 bg-white/3 p-5">
                    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="text-lg font-semibold text-white">{project.title}</div>
                      <span className={cn('rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]', project.accent)}>
                        {project.period}
                      </span>
                    </div>
                    <ul className="space-y-3 text-sm leading-7 text-foreground/90">
                      {project.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/90" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up delay-300">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Education</div>
                  <h2 className="text-2xl font-semibold text-white">Academic Background</h2>
                </div>

                <div className="space-y-4">
                  {EDUCATION.map((item) => (
                    <div key={item.school} className="rounded-[24px] border border-white/8 bg-white/3 p-5">
                      <div className="text-lg font-medium text-white mb-1">{item.school}</div>
                      <div className="text-sm text-cyan-300 mb-2">{item.degree}</div>
                      <div className="text-sm text-muted-foreground">{item.location} · {item.period}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up delay-400">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Capabilities</div>
                  <h2 className="text-2xl font-semibold text-white">Technical Coverage</h2>
                </div>

                <div className="space-y-5">
                  {SKILL_GROUPS.map((group) => (
                    <div key={group.title} className="rounded-[24px] border border-white/8 bg-white/3 p-5">
                      <h3 className="text-base font-medium text-white mb-3">{group.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span key={item} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="glow-card rounded-[32px] p-6 lg:p-8 animate-fade-up delay-500">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-300 mb-2">Next Step</div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Want the conversational version?</h2>
                  <p className="text-sm leading-7 text-muted-foreground max-w-2xl">
                    You can also ask the AI chat about my experience, projects, or technical decisions. It answers from my actual resume and project content.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={RESUME_PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'border-white/10 hover:border-white/30 hover:bg-white/5',
                    )}
                  >
                    Open Resume PDF
                  </a>
                  <Link
                    href="/chat"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/25',
                    )}
                  >
                    Open AI Chat
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
