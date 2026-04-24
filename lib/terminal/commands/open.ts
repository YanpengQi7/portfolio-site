import type { CommandHandler } from '@/lib/terminal/types'

export const openRoute: CommandHandler = async function* ({ args }) {
  const target = args[0]
  if (!target) {
    yield { type: 'line', content: 'usage: open <route>' }
    return
  }

  const href = target.startsWith('/') ? target : `/${target}`
  yield { type: 'open', href }
  yield { type: 'line', content: `opening ${href}` }
}
