import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'
import { createProviderWithFallback } from '@/lib/ai/provider'
import { checkChatRateLimit, getClientIp } from '@/lib/ai/rate-limit'
import { isConversationStoreEnabled, saveConversation } from '@/lib/ai/conversation-store'
import { retrieveRag } from '@/lib/ai/retrieval'
import { buildSystemPrompt } from '@/lib/ai/system-prompt'

export const maxDuration = 30

function getMessageText(message: UIMessage | undefined): string {
  if (!message) return ''

  const parts = (message as UIMessage & { parts?: unknown[] }).parts
  if (Array.isArray(parts)) {
    return parts
      .map(part => {
        if (typeof part !== 'object' || part === null) return ''
        const candidate = part as { type?: unknown; text?: unknown }
        if (candidate.type !== 'text') return ''
        return typeof candidate.text === 'string' ? candidate.text : ''
      })
      .join('')
      .trim()
  }

  return String((message as { content?: unknown }).content ?? '').trim()
}

function buildRetrievalQuery(messages: UIMessage[], lastUserText: string): string {
  const recentUserTurns = messages
    .filter(message => message.role === 'user')
    .slice(-3)
    .map(getMessageText)
    .filter(Boolean)

  if (recentUserTurns.length === 0) return lastUserText

  const query = Array.from(new Set([...recentUserTurns, lastUserText]))
    .join('\n')
    .slice(0, 1200)

  return query || lastUserText
}

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
  const lastUserText = getMessageText(lastUserMessage)
  const retrievalQuery = buildRetrievalQuery(messages, lastUserText)

  // RAG: retrieve relevant content chunks. Include recent user turns so
  // follow-up questions like "what about that project?" keep their subject.
  const rag = await retrieveRag(retrievalQuery, 6)
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
