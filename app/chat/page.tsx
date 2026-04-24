'use client'

import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const SUGGESTIONS = [
  { text: "What AI projects has Yanpeng built?", icon: "🤖" },
  { text: "How does the RAG pipeline in Admitly work?", icon: "🔍" },
  { text: "What has Yanpeng done at Amazon?", icon: "☁️" },
  { text: "Tell me about the AI Financial Agent", icon: "📈" },
  { text: "What makes Yanpeng a strong hire?", icon: "⚡" },
]

type TextPart = { type: 'text'; text: string }

type RagChunk = { source: string; kind: string; score: number; snippet: string }
type AssistantMetadata = {
  provider?: string
  rag?: { chunks: RagChunk[]; fallback: boolean; query: string }
}

function getTextFromMessage(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return (parts as TextPart[])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')
}

const KIND_COLORS: Record<string, string> = {
  project: 'text-purple-300 border-purple-400/30 bg-purple-400/5',
  profile: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/5',
  skills: 'text-green-300 border-green-400/30 bg-green-400/5',
  blog: 'text-amber-300 border-amber-400/30 bg-amber-400/5',
  other: 'text-slate-300 border-slate-400/30 bg-slate-400/5',
}

const PROVIDER_INFO: Record<string, {
  label: string
  dotClass: string
  borderClass: string
  textClass: string
  isFallback: boolean
}> = {
  google: {
    label: 'Gemini 2.5 Flash',
    dotClass: 'bg-green-400',
    borderClass: 'border-cyan-400/30',
    textClass: 'text-muted-foreground',
    isFallback: false,
  },
  groq: {
    label: 'Groq Llama 3.3 70B',
    dotClass: 'bg-amber-400',
    borderClass: 'border-amber-400/30',
    textClass: 'text-amber-200',
    isFallback: true,
  },
}

function ModelBadge({ provider }: { provider?: string }) {
  const info = (provider && PROVIDER_INFO[provider]) || PROVIDER_INFO.google
  return (
    <div
      className={`flex items-center gap-2 text-xs ${info.textClass} glass px-3 py-1.5 rounded-full border ${info.borderClass} transition-colors`}
      title={info.isFallback ? 'Primary provider unavailable — using fallback' : 'Primary model'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass} animate-pulse`} />
      <span className="font-medium">{info.label}</span>
      <span className="opacity-40">·</span>
      <span>RAG</span>
      {info.isFallback && (
        <>
          <span className="opacity-40">·</span>
          <span className="text-amber-300 font-medium">fallback</span>
        </>
      )}
    </div>
  )
}

type TraceStage = {
  id: string
  label: string
  status: 'done' | 'active' | 'pending'
}

function ThinkingTrace({
  stages,
}: {
  stages: TraceStage[]
}) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glass border border-cyan-500/30 text-sm">
        🤖
      </div>
      <div className="glass border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 min-w-[240px]">
        <ul className="space-y-1.5">
          {stages.map(stage => (
            <li
              key={stage.id}
              className={cn(
                'flex items-center gap-2 text-xs font-mono transition-all',
                stage.status === 'done' && 'text-muted-foreground',
                stage.status === 'active' && 'text-cyan-300',
                stage.status === 'pending' && 'text-muted-foreground/40',
              )}
            >
              <span className="w-3 flex justify-center">
                {stage.status === 'done' && (
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {stage.status === 'active' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
                {stage.status === 'pending' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                )}
              </span>
              <span className={stage.status === 'active' ? 'animate-pulse' : ''}>
                {stage.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RagPanel({ rag }: { rag: NonNullable<AssistantMetadata['rag']> }) {
  const [open, setOpen] = useState(false)
  const maxScore = Math.max(1, ...rag.chunks.map(c => c.score))
  if (!rag.chunks.length) return null

  return (
    <div className="mt-2 text-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full glass border border-white/10 text-muted-foreground hover:text-white hover:border-cyan-400/30 transition-all"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>RAG · {rag.chunks.length} chunk{rag.chunks.length === 1 ? '' : 's'} retrieved</span>
        {rag.fallback && <span className="text-amber-300">· fallback</span>}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 space-y-2 animate-fade-up">
          {rag.chunks.map((c, i) => {
            const pct = rag.fallback ? 0 : Math.round((c.score / maxScore) * 100)
            const color = KIND_COLORS[c.kind] ?? KIND_COLORS.other
            return (
              <div key={i} className={`rounded-xl border ${color} p-3`}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] opacity-60">#{i + 1}</span>
                    <span className="font-mono truncate">{c.source}</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-70 flex-shrink-0">
                    score {c.score}{rag.fallback ? '' : ` · ${pct}%`}
                  </span>
                </div>
                {!rag.fallback && (
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">
                  {c.snippet}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  const [conversationId] = useState(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`)
  const { messages, sendMessage, status, error, clearError } = useChat({
    id: conversationId,
  })
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  // Compute live-model info from the most recent assistant message's metadata.
  // Falls back to 'google' before the first response arrives.
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
  const lastAssistantMeta = (lastAssistant as { metadata?: AssistantMetadata } | undefined)?.metadata
  const activeProvider = lastAssistantMeta?.provider

  // Thinking trace: derive current stage from status + whether the in-flight
  // assistant message has metadata / text yet.
  const inFlight = isLoading ? lastAssistant : undefined
  const inFlightMeta = inFlight ? (inFlight as { metadata?: AssistantMetadata }).metadata : undefined
  const inFlightText = inFlight ? getTextFromMessage(inFlight.parts) : ''
  const showTrace = isLoading && !inFlightText
  const traceStages: TraceStage[] = (() => {
    const hasMeta = Boolean(inFlightMeta?.rag)
    const chunkCount = inFlightMeta?.rag?.chunks.length ?? 0
    const provName = inFlightMeta?.provider
      ? (PROVIDER_INFO[inFlightMeta.provider]?.label ?? inFlightMeta.provider)
      : 'model'
    return [
      {
        id: 'plan',
        label: 'Planning query',
        status: hasMeta ? 'done' : 'active',
      },
      {
        id: 'retrieve',
        label: hasMeta ? `Retrieved ${chunkCount} chunk${chunkCount === 1 ? '' : 's'}` : 'Retrieving from RAG',
        status: hasMeta ? 'done' : (status === 'submitted' ? 'pending' : 'active'),
      },
      {
        id: 'synth',
        label: hasMeta ? `Synthesizing with ${provName}` : 'Synthesizing',
        status: hasMeta ? 'active' : 'pending',
      },
    ]
  })()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    const text = input.trim()
    if (!text || isLoading) return
    if (error) clearError()
    sendMessage({ text }, { body: { conversationId } })
    setInput('')
  }

  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 8%) 0%, transparent 70%)' }} />
        <div className="animate-ambient absolute bottom-12 right-[-10rem] h-[360px] w-[360px] rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, oklch(0.82 0.13 280 / 8%) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 dot-bg opacity-15" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <ModelBadge provider={activeProvider} />
        </div>
      </nav>

      {/* Chat area */}
      <div className="relative flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="animate-fade-up text-center mb-10">
              <div className="text-4xl mb-4 animate-float inline-block">🤖</div>
              <h1 className="text-2xl font-bold text-white mb-2">Ask me anything</h1>
              <p className="text-muted-foreground text-sm mb-8">
                AI trained on Yanpeng&apos;s resume & projects. Grounded answers only.
              </p>
              <div className="grid gap-2 max-w-md mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage({ text: s.text }, { body: { conversationId } })}
                    className={`animate-fade-up delay-${(i + 1) * 100} w-full text-left px-4 py-3 rounded-xl glass border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-sm text-muted-foreground hover:text-white group flex items-center gap-3`}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error.message}
              </div>
            )}

            {messages.map(m => {
              const text = getTextFromMessage(m.parts)
              if (!text && m.role === 'assistant') return null
              const isUser = m.role === 'user'
              const meta = (m as { metadata?: AssistantMetadata }).metadata

              return (
                <div key={m.id}
                  className={`flex gap-3 animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glass border border-cyan-500/30 text-sm">
                      🤖
                    </div>
                  )}
                  <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      isUser
                        ? 'bg-cyan-500 text-black font-medium rounded-br-sm'
                        : 'glass border border-white/5 text-foreground rounded-bl-sm chat-markdown'
                    )}>
                      {isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}
                    </div>
                    {!isUser && meta?.rag && <RagPanel rag={meta.rag} />}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                      👤
                    </div>
                  )}
                </div>
              )
            })}

            {/* Thinking trace (replaces plain typing dots) */}
            {showTrace && <ThinkingTrace stages={traceStages} />}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="relative flex-shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form
            onSubmit={e => { e.preventDefault(); submit() }}
            className="chat-input-shell flex gap-3 items-center rounded-2xl">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
              placeholder="Ask about my experience, projects, or skills..."
              className="relative z-10 flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="magnetic-button relative z-10 rounded-xl h-11 w-11 bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-cyan-500/25 flex-shrink-0 p-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60 text-center mt-2">
            Answers grounded in Yanpeng&apos;s actual resume · Stateful demo conversation
          </p>
        </div>
      </div>
    </main>
  )
}
