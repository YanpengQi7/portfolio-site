import type { TerminalChunk } from '@/lib/terminal/types'

export async function* line(content: string): AsyncIterable<TerminalChunk> {
  yield { type: 'line', content }
}

export async function* lines(values: string[]): AsyncIterable<TerminalChunk> {
  yield { type: 'line', content: values.join('\n') }
}

export function splitPipes(input: string): string[] {
  const segments: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (const char of input) {
    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote === char ? null : char
      current += char
      continue
    }

    if (char === '|' && !quote) {
      segments.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  if (current.trim()) {
    segments.push(current.trim())
  }

  return segments
}

export function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null

  for (const char of input.trim()) {
    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote === char ? null : char
      continue
    }

    if (/\s/.test(char) && !quote) {
      if (current) {
        tokens.push(current)
        current = ''
      }
      continue
    }

    current += char
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}
