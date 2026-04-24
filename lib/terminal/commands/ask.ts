import type { CommandHandler, TerminalChunk } from '@/lib/terminal/types'

function buildQuestion(args: string[], stdin?: string) {
  const question = args.join(' ').trim()
  if (!stdin) return question

  return [
    'Use the following context as the primary source of truth.',
    '',
    stdin,
    '',
    `Question: ${question || 'Summarize the context clearly.'}`,
  ].join('\n')
}

async function* parseSseStream(stream: ReadableStream<Uint8Array<ArrayBuffer>>, abortSignal: AbortSignal): AsyncIterable<TerminalChunk> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (!abortSignal.aborted) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const dataLine = event
          .split('\n')
          .find(line => line.startsWith('data: '))

        if (!dataLine) continue
        const data = dataLine.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data) as { type?: string; delta?: string }
          if (parsed.type === 'text-delta' && parsed.delta) {
            yield { type: 'line', content: parsed.delta }
          }
        } catch {
          continue
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export const ask: CommandHandler = async function* ({ args, stdin, abortSignal }) {
  const text = buildQuestion(args, stdin)
  if (!text.trim()) {
    yield { type: 'line', content: 'usage: ask "<question>"' }
    return
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    signal: abortSignal,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          id: `terminal_${Date.now()}`,
          role: 'user',
          parts: [{ type: 'text', text }],
        },
      ],
      conversationId: `terminal_${Date.now()}`,
    }),
  })

  if (!response.ok || !response.body) {
    const message = await response.text()
    yield { type: 'line', content: message || 'AI request failed' }
    return
  }

  yield* parseSseStream(response.body, abortSignal)
}
