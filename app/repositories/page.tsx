import Link from 'next/link'

const PUBLIC_REPOS = [
  {
    name: 'study-abroad-platform',
    description: 'A production-oriented study abroad platform with product thinking, web engineering, and user workflow design.',
    language: 'TypeScript',
    url: 'https://github.com/YanpengQi7/study-abroad-platform',
    accent: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/8',
    notes: ['Full-stack product build', 'User-facing workflow design', 'Deployed project'],
  },
  {
    name: 'my-notes',
    description: 'A clean note-taking application built with React and Supabase, showing UI polish and practical CRUD architecture.',
    language: 'JavaScript',
    url: 'https://github.com/YanpengQi7/my-notes',
    accent: 'text-green-300 border-green-400/20 bg-green-400/8',
    notes: ['React UI system', 'Supabase-backed app', 'Product-focused build'],
  },
]

const PRIVATE_WORK = [
  {
    name: 'admitly',
    description: 'AI-native graduate admissions copilot with multi-agent workflows, hybrid retrieval, and model routing.',
    language: 'TypeScript',
    status: 'Private repository',
    notes: ['16 task-tagged AI ops', 'Hybrid RAG', 'Cost-aware model routing'],
  },
  {
    name: 'portfolio-site',
    description: 'Personal portfolio with AI chat, grounded resume retrieval, streaming responses, and editorial content surfaces.',
    language: 'TypeScript',
    status: 'Private repository',
    notes: ['Next.js 16', 'Gemini + fallback', 'Resume-grounded AI chat'],
  },
]

export const metadata = {
  title: 'Yanpeng Qi — Repositories',
  description: 'Selected repositories and codebases from Yanpeng Qi.',
}

export default function RepositoriesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 right-0 w-[540px] h-[540px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 10%) 0%, transparent 72%)' }}
        />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/cv" className="hover:text-white transition-colors">CV</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/chat" className="hover:text-white transition-colors">AI Chat</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.22em] text-cyan-300 mb-5">
            Repositories
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Selected code, not just commits.</h1>
          <p className="max-w-3xl text-lg text-muted-foreground leading-8">
            A small curated view of public repositories and private systems that best represent how I think about product, AI, and implementation quality.
          </p>
        </div>

        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-white mb-2">Public Repositories</h2>
            <p className="text-muted-foreground">Open projects you can browse directly on GitHub.</p>
          </div>

          <div className="grid gap-5">
            {PUBLIC_REPOS.map((repo, index) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`animate-fade-up delay-${Math.min((index + 1) * 100, 700)} glow-card rounded-[28px] p-6 block group`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {repo.name}
                      </h3>
                      <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${repo.accent}`}>
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-7 mb-4">{repo.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {repo.notes.map(note => (
                        <span key={note} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-white">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-cyan-300 group-hover:translate-x-0.5 transition-transform">Open GitHub</div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-white mb-2">Private Systems</h2>
            <p className="text-muted-foreground">Representative codebases that are not publicly accessible but reflect my current focus.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {PRIVATE_WORK.map((repo, index) => (
              <div key={repo.name} className={`animate-fade-up delay-${Math.min((index + 3) * 100, 700)} glow-card rounded-[28px] p-6`}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                  <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {repo.status}
                  </span>
                </div>
                <p className="text-muted-foreground leading-7 mb-4">{repo.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-300">
                    {repo.language}
                  </span>
                  {repo.notes.map(note => (
                    <span key={note} className="glass rounded-full border border-white/8 px-3 py-1 text-xs text-white">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
