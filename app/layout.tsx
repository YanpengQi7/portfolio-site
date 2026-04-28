import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import ThemeInitScript from '@/components/theme-init-script'
import CommandPalette from '@/components/command-palette'
import ThemeToggle from '@/components/theme-toggle'
import CursorFx from '@/components/cursor-fx'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yanpeng Qi — AI Builder & SDE',
  description: 'Software Development Engineer at Amazon. Building AI systems with RAG, multi-agent orchestration, and LLM integrations at scale.',
  metadataBase: new URL('https://yanpengqi.com'),
  openGraph: {
    title: 'Yanpeng Qi — AI Builder & SDE',
    description: 'Software engineer building production AI systems, RAG pipelines, multi-agent workflows, and practical product experiences.',
    url: 'https://yanpengqi.com',
    siteName: 'Yanpeng Qi',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yanpeng Qi — AI Builder & SDE',
    description: 'Software engineer building production AI systems, RAG pipelines, multi-agent workflows, and practical product experiences.',
  },
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeInitScript />
        {children}
        <CursorFx />
        <CommandPalette />
        <ThemeToggle />
        <Analytics />
      </body>
    </html>
  )
}
