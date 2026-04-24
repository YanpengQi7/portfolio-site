import type { CommandHandler } from '@/lib/terminal/types'
import { lines } from '@/lib/terminal/utils'

export const help: CommandHandler = async () => {
  return lines([
    'Available commands:',
    '  help               Show this help',
    '  whoami             Short profile summary',
    '  ls [path]          List content files',
    '  cat <path>         Read a markdown file from content/',
    '  ask "<question>"   Send a question through the RAG chat pipeline',
    '  open <route>       Navigate to a route like /blog or projects',
    '  theme dark|light   Switch the site theme',
    '  clear              Clear the terminal history',
    '',
    'Pipes are supported:',
    '  cat projects/admitly.md | ask "summarize in one sentence"',
  ])
}
