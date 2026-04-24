import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { ThemeMode } from '@/lib/theme-client'

export type TerminalChunk =
  | { type: 'line'; content: string }
  | { type: 'clear' }
  | { type: 'open'; href: string }
  | { type: 'theme'; theme: ThemeMode }

export type CommandContext = {
  args: string[]
  stdin?: string
  router: AppRouterInstance
  setTheme: (theme: ThemeMode) => void
  abortSignal: AbortSignal
}

export type CommandHandler = (
  ctx: CommandContext
) => AsyncIterable<TerminalChunk> | Promise<AsyncIterable<TerminalChunk>>
