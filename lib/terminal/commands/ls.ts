import type { CommandHandler } from '@/lib/terminal/types'
import { line } from '@/lib/terminal/utils'

export const ls: CommandHandler = async ({ args }) => {
  const path = args[0] ?? ''
  const response = await fetch(`/api/terminal/fs?op=list&path=${encodeURIComponent(path)}`)
  const payload = await response.json()

  if (!response.ok) {
    return line(payload.error ?? 'Unable to list files')
  }

  return line(payload.entries.join('  '))
}
