import type { CommandHandler } from '@/lib/terminal/types'
import { lines } from '@/lib/terminal/utils'

export const whoami: CommandHandler = async () => {
  return lines([
    'Yanpeng Qi',
    'Software engineer building production AI systems, RAG pipelines,',
    'multi-agent workflows, and full-stack product experiences.',
    'Current focus: grounded AI products, applied infra, and practical UX.',
  ])
}
