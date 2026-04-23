'use client'

import Link from 'next/link'
import { useChat } from '@ai-sdk/react'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRef, useEffect, useState } from 'react'

const SUGGESTIONS = [
  "What AI projects has Yanpeng built?",
  "How does the RAG pipeline in Admitly work?",
  "What's Yanpeng's tech stack?",
  "Tell me about the auto-apply Chrome extension",
  "What makes Yanpeng a good hire?",
]

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestion = (text: string) => {
    if (isLoading) return
    sendMessage({ text })
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="font-semibold text-lg">Yanpeng Qi</span>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
        </div>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 flex flex-col">
        <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-6 -ml-2 self-start gap-1')}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Ask me anything</h1>
          <p className="text-muted-foreground">
            AI chatbot trained on my resume & projects. Powered by Gemini Flash + RAG.
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 min-h-[300px]">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try asking:</p>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="block w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map(m => {
            const textContent = m.parts
              .filter((p): p is { type: 'text'; text: string; state?: 'streaming' | 'done' } => p.type === 'text')
              .map(p => p.text)
              .join('')

            return (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" /></svg>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}>
                  {textContent}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
              </div>
            )
          })}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" /></svg>
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about my projects, skills, or experience..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="rounded-lg h-12 w-12">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Powered by Gemini Flash · Answers grounded in Yanpeng&apos;s actual resume
        </p>
      </div>
    </main>
  )
}
