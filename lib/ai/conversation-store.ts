import { createHash } from 'node:crypto'
import { Redis } from '@upstash/redis'
import type { UIMessage } from 'ai'

const CONVERSATION_PREFIX = 'portfolio-site:conversation'
const CONVERSATION_INDEX_KEY = 'portfolio-site:conversations:recent'
const CONVERSATION_TTL_SECONDS = 60 * 60 * 24 * 30

type SaveConversationInput = {
  conversationId: string
  ip: string
  messages: UIMessage[]
  provider: string
  finishReason?: string
  isAborted: boolean
  lastUserText: string
  context: string
  ragChunks?: Array<{ source: string; kind: string; score: number; snippet: string }>
}

type ConversationStoreResult =
  | { enabled: true; saved: true; key: string }
  | { enabled: false; saved: false; reason: string }
  | { enabled: true; saved: false; reason: string }

const redisUrl = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const redis = redisUrl && redisToken
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null

function hashIdentifier(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

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

function compactMessage(message: UIMessage) {
  return {
    id: message.id,
    role: message.role,
    text: getMessageText(message),
  }
}

export function isConversationStoreEnabled(): boolean {
  return Boolean(redis)
}

export async function saveConversation(input: SaveConversationInput): Promise<ConversationStoreResult> {
  if (!redis) {
    return {
      enabled: false,
      saved: false,
      reason: 'KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not configured',
    }
  }

  const now = new Date().toISOString()
  const key = `${CONVERSATION_PREFIX}:${input.conversationId}`
  const assistantMessage = input.messages.findLast(message => message.role === 'assistant')

  try {
    await redis.set(
      key,
      {
        id: input.conversationId,
        updatedAt: now,
        ipHash: hashIdentifier(input.ip),
        provider: input.provider,
        finishReason: input.finishReason ?? null,
        isAborted: input.isAborted,
        messageCount: input.messages.length,
        lastUserText: input.lastUserText,
        lastAssistantText: getMessageText(assistantMessage),
        contextPreview: input.context.slice(0, 1200),
        ragChunks: input.ragChunks ?? [],
        messages: input.messages.map(compactMessage),
      },
      { ex: CONVERSATION_TTL_SECONDS },
    )

    await redis.zadd(CONVERSATION_INDEX_KEY, {
      score: Date.now(),
      member: input.conversationId,
    })
    await redis.expire(CONVERSATION_INDEX_KEY, CONVERSATION_TTL_SECONDS)

    return { enabled: true, saved: true, key }
  } catch (error) {
    console.warn('[AI] Failed to persist conversation', error)
    return {
      enabled: true,
      saved: false,
      reason: error instanceof Error ? error.message : 'Unknown Redis error',
    }
  }
}
