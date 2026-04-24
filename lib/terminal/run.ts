import type { CommandContext, TerminalChunk } from '@/lib/terminal/types'
import { COMMAND_REGISTRY } from '@/lib/terminal/registry'
import { splitPipes, tokenize } from '@/lib/terminal/utils'

export async function executeCommand(
  input: string,
  baseContext: Omit<CommandContext, 'args' | 'stdin'>
): Promise<TerminalChunk[]> {
  const chunks: TerminalChunk[] = []
  const segments = splitPipes(input)
  let stdin = ''

  for (const segment of segments) {
    const tokens = tokenize(segment)
    const [commandName, ...args] = tokens

    if (!commandName) continue

    const handler = COMMAND_REGISTRY[commandName]
    if (!handler) {
      chunks.push({ type: 'line', content: `command not found: ${commandName}` })
      return chunks
    }

    const iterable = await handler({
      ...baseContext,
      args,
      stdin,
    })

    stdin = ''

    for await (const chunk of iterable) {
      chunks.push(chunk)
      if (chunk.type === 'line') {
        stdin += chunk.content
      }
    }
  }

  return chunks
}
