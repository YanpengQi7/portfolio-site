import type { CommandHandler } from '@/lib/terminal/types'

export const theme: CommandHandler = async function* ({ args }) {
  const value = args[0]
  if (value !== 'dark' && value !== 'light') {
    yield { type: 'line', content: 'usage: theme dark|light' }
    return
  }

  yield { type: 'theme', theme: value }
  yield { type: 'line', content: `theme set to ${value}` }
}
