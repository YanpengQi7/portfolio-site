import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import ThemeInitScript from '@/components/theme-init-script'
import ThemeToggle from '@/components/theme-toggle'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yanpeng Qi — AI Builder & SDE',
  description: 'Software Development Engineer at Amazon. Building AI systems with RAG, multi-agent orchestration, and LLM integrations at scale.',
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
        <ThemeToggle />
        <Analytics />
      </body>
    </html>
  )
}
