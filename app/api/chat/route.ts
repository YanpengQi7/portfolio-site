import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { createProviderWithFallback } from '@/lib/ai/provider'
import { retrieveContext } from '@/lib/ai/retrieval'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Get the last user message text for RAG retrieval
  const lastUserMessage = messages.findLast(m => m.role === 'user')
  const lastUserText = lastUserMessage?.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('') ?? ''

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
