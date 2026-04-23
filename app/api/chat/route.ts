import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { createProviderWithFallback } from '@/lib/ai/provider'
import { checkChatRateLimit, getClientIp } from '@/lib/ai/rate-limit'
import { isConversationStoreEnabled, saveConversation } from '@/lib/ai/conversation-store'
import { retrieveRag } from '@/lib/ai/retrieval'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'

export const maxDuration = 30

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const rateLimit = await checkChatRateLimit(ip)

  if (!rateLimit.success) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((rateLimit.reset - Date.now()) / 1000),
    )

    return new Response(
      `Too many chat requests. Please wait about ${retryAfterSeconds} seconds and try again.`,
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.reset),
        },
      },
    )
  }

  const {
    messages,
    conversationId = crypto.randomUUID(),
  }: { messages: UIMessage[]; conversationId?: string } = await req.json()

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
  const rag = await retrieveRag(lastUserText)
  const context = rag.context

  // Compact chunk preview for the client (source + score + snippet)
  const ragPreview = rag.chunks.map(c => ({
    source: c.source,
    kind: c.kind,
    score: c.score,
    snippet: c.text.length > 260 ? c.text.slice(0, 260) + '…' : c.text,
  }))

  // Build grounded system prompt
  const systemPrompt = buildSystemPrompt(context)

  // Get model (with Groq fallback)
  const { model, provider } = await createProviderWithFallback()

  const result = streamText({
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 800,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      if (part.type === 'start') {
        return {
          provider,
          rag: { chunks: ragPreview, fallback: rag.fallback, query: lastUserText },
        }
      }
    },
    onFinish: async event => {
      await saveConversation({
        conversationId,
        ip,
        messages: event.messages,
        provider,
        finishReason: event.finishReason,
        isAborted: event.isAborted,
        lastUserText,
        context,
        ragChunks: ragPreview,
      })
    },
    headers: {
      'X-RateLimit-Limit': String(rateLimit.limit),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.reset),
      'X-Conversation-Id': conversationId,
      'X-Conversation-Store': isConversationStoreEnabled() ? 'enabled' : 'disabled',
    },
  })
}
