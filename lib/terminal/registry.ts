import type { CommandHandler } from '@/lib/terminal/types'
import { ask } from '@/lib/terminal/commands/ask'
import { cat } from '@/lib/terminal/commands/cat'
import { clear } from '@/lib/terminal/commands/clear'
import { help } from '@/lib/terminal/commands/help'
import { ls } from '@/lib/terminal/commands/ls'
import { openRoute } from '@/lib/terminal/commands/open'
import { theme } from '@/lib/terminal/commands/theme'
import { whoami } from '@/lib/terminal/commands/whoami'

export const COMMAND_REGISTRY: Record<string, CommandHandler> = {
  ask,
  cat,
  clear,
  help,
  ls,
  open: openRoute,
  theme,
  whoami,
}
