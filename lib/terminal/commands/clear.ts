import type { CommandHandler } from '@/lib/terminal/types'

export const clear: CommandHandler = async function* () {
  yield { type: 'clear' }
}
