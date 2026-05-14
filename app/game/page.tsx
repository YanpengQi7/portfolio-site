import Link from 'next/link'
import type { Metadata } from 'next'
import TypingGame from '@/components/typing-game'

export const metadata: Metadata = {
  title: 'Typing Drop — Yanpeng Qi',
  description: 'A small typing survival game with falling words, combos, levels, and local high score.',
  openGraph: {
    title: 'Typing Drop — Yanpeng Qi',
    description: 'A small typing survival game with falling words, combos, levels, and local high score.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typing Drop — Yanpeng Qi',
    description: 'A small typing survival game with falling words, combos, levels, and local high score.',
  },
}

export default function GamePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div
          className="absolute -top-52 right-0 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 0.18), transparent 68%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.64 0.18 150 / 0.12), transparent 70%)',
          }}
        />
      </div>

      <nav className="relative z-50 border-b border-white/5 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="font-bold text-lg shimmer-text">
            YQ
          </Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <Link href="/projects" className="transition-colors hover:text-white">
              Projects
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <TypingGame />
      </div>
    </main>
  )
}
