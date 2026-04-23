import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { createProviderWithFallback } from '@/lib/ai/provider'
import { retrieveContext } from '@/lib/ai/retrieval'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Extract last user message text for RAG (UIMessage parts array)
  const lastUserMessage = messages.findLast(m => m.role === 'user')
  const lastUserText = lastUserMessage
    ? (Array.isArray((lastUserMessage as UIMessage & { parts?: unknown[] }).parts)
        ? (lastUserMessage as UIMessage & { parts: Array<{ type: string; text?: string }> }).parts
            .filter(p => p.type === 'text')
            .map(p => p.text ?? '')
            .join('')
        : String((lastUserMessage as { content?: unknown }).content ?? ''))
    : ''

  // RAG: retrieve relevant content chunks
  const context = await retrieveContext(lastUserText)

  // Build grounded system prompt
  const systemPrompt = buildSystemPrompt(context)

  // Get model (with Groq fallback)
  const { model } = await createProviderWithFallback()

  const result = streamText({
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 800,
  })

  return result.toUIMessageStreamResponse()
}
