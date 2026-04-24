import type { CommandHandler } from '@/lib/terminal/types'
import { line } from '@/lib/terminal/utils'

export const cat: CommandHandler = async ({ args }) => {
  const path = args[0]
  if (!path) {
    return line('usage: cat <content-path>')
  }

  const response = await fetch(`/api/terminal/fs?op=read&path=${encodeURIComponent(path)}`)
  const payload = await response.json()

  if (!response.ok) {
    return line(payload.error ?? 'Unable to read file')
  }

  return line(payload.content)
}
