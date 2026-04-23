'use client'

import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { buttonVariants } from '@/components/ui/button'
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

function getTextFromMessage(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return (parts as TextPart[])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')
}

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  return (
    <main className="h-screen bg-background flex flex-col overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, oklch(0.72 0.18 210 / 8%) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 dot-bg opacity-15" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-md bg-background/60 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg shimmer-text">YQ</Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground glass px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Gemini 2.5 Flash · RAG
          </div>
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
                    onClick={() => sendMessage({ text: s.text })}
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
            {messages.map(m => {
              const text = getTextFromMessage(m.parts)
              if (!text && m.role === 'assistant') return null
              const isUser = m.role === 'user'

              return (
                <div key={m.id}
                  className={`flex gap-3 animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glass border border-cyan-500/30 text-sm">
                      🤖
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isUser
                      ? 'bg-cyan-500 text-black font-medium rounded-br-sm'
                      : 'glass border border-white/5 text-foreground rounded-bl-sm chat-markdown'
                  )}>
                    {isUser ? text : <ReactMarkdown>{text}</ReactMarkdown>}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm">
                      👤
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glass border border-cyan-500/30 text-sm">
                  🤖
                </div>
                <div className="glass border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="relative flex-shrink-0 border-t border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form
            onSubmit={e => { e.preventDefault(); submit() }}
            className="flex gap-3 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
              placeholder="Ask about my experience, projects, or skills..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl h-11 w-11 bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg shadow-cyan-500/25 flex-shrink-0 p-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60 text-center mt-2">
            Answers grounded in Yanpeng&apos;s actual resume · Not general AI advice
          </p>
        </div>
      </div>
    </main>
  )
}
