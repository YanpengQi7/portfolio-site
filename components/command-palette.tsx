'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import TerminalTrigger from '@/components/terminal-trigger'
import { useKeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcut'
import { applyTheme } from '@/lib/theme-client'
import { executeCommand } from '@/lib/terminal/run'

type HistoryEntry =
  | { id: string; type: 'input'; content: string }
  | { id: string; type: 'output'; content: string }

const HISTORY_KEY = 'terminal-history'
const BOOT_LINES = [
  '╔══════════════════════════════════╗',
  '║   yanpeng.os v2026.4.23          ║',
  '╚══════════════════════════════════╝',
  '',
  '[✓] Mounting /content',
  '[✓] Loading RAG pipeline',
  '[✓] Connecting to Gemini 2.5 Flash',
  '[✓] Ready.',
  '',
  'Type `help` to see available commands.',
  'Try: ask "What AI projects has Yanpeng built?"',
]

function readStoredHistory() {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = window.localStorage.getItem(HISTORY_KEY)
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string').slice(0, 30)
      : []
  } catch {
    window.localStorage.removeItem(HISTORY_KEY)
    return []
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [history, setHistory] = useState<string[]>(readStoredHistory)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const [streaming, setStreaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const bootedRef = useRef(false)
  const router = useRouter()

  useKeyboardShortcut(['mod+k'], () => {
    setOpen(current => !current)
  })

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 20)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [entries, open])

  const boot = useCallback(() => {
    if (bootedRef.current) return
    bootedRef.current = true
    setEntries(BOOT_LINES.map((line, index) => ({
      id: `boot_${index}`,
      type: 'output',
      content: line,
    })))
  }, [])

  useEffect(() => {
    if (open) {
      boot()
    }
  }, [boot, open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const appendOutput = useCallback((content: string) => {
    setEntries(current => [
      ...current,
      { id: `out_${crypto.randomUUID()}`, type: 'output', content },
    ])
  }, [])

  const runCommand = useCallback(async (command: string) => {
    const trimmed = command.trim()
    if (!trimmed || streaming) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setEntries(current => [
      ...current,
      { id: `in_${crypto.randomUUID()}`, type: 'input', content: trimmed },
    ])
    setHistory(current => {
      const next = [trimmed, ...current.filter(item => item !== trimmed)].slice(0, 30)
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      return next
    })
    setHistoryIndex(null)
    setInput('')
    setStreaming(true)

    const chunks = await executeCommand(trimmed, {
      router,
      setTheme: applyTheme,
      abortSignal: controller.signal,
    })

    let buffered = ''
    for (const chunk of chunks) {
      if (chunk.type === 'clear') {
        setEntries([])
        buffered = ''
        continue
      }

      if (chunk.type === 'open') {
        setOpen(false)
        router.push(chunk.href)
        continue
      }

      if (chunk.type === 'theme') {
        applyTheme(chunk.theme)
        continue
      }

      if (chunk.type === 'line') {
        buffered += chunk.content
      }
    }

    if (buffered) {
      appendOutput(buffered)
    }

    setStreaming(false)
  }, [appendOutput, router, streaming])

  const historyPreview = useMemo(() => history.slice(0, 8), [history])

  return (
    <>
      <TerminalTrigger onClick={() => setOpen(true)} />

      {open && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-[8vh] h-[76vh] w-[min(860px,92vw)] rounded-2xl border border-white/10 bg-black/90 p-4 text-green-300 shadow-2xl shadow-black/50"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <span className="ml-2">yanpeng.os</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">⌘K / Ctrl+K</div>
            </div>

            <div ref={scrollRef} className="h-[calc(100%-5rem)] overflow-y-auto font-mono text-sm">
              <div className="space-y-2">
                {entries.map(entry => (
                  <div key={entry.id} className={entry.type === 'input' ? 'text-cyan-300' : 'text-green-300'}>
                    {entry.type === 'input' ? (
                      <span>$ {entry.content}</span>
                    ) : (
                      <pre className="whitespace-pre-wrap break-words">{entry.content}</pre>
                    )}
                  </div>
                ))}
                {streaming && (
                  <div className="text-cyan-300">$ <span className="animate-pulse">running...</span></div>
                )}
              </div>
            </div>

            <form
              onSubmit={event => {
                event.preventDefault()
                void runCommand(input)
              }}
              className="mt-3 border-t border-white/10 pt-3"
            >
              <label className="flex items-center gap-3 font-mono text-sm">
                <span className="text-cyan-300">$</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Escape') {
                      setOpen(false)
                      return
                    }

                    if (event.key === 'ArrowUp') {
                      event.preventDefault()
                      if (!history.length) return
                      const nextIndex = historyIndex === null ? 0 : Math.min(historyIndex + 1, history.length - 1)
                      setHistoryIndex(nextIndex)
                      setInput(history[nextIndex] ?? '')
                    }

                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      if (historyIndex === null) return
                      const nextIndex = historyIndex - 1
                      if (nextIndex < 0) {
                        setHistoryIndex(null)
                        setInput('')
                        return
                      }
                      setHistoryIndex(nextIndex)
                      setInput(history[nextIndex] ?? '')
                    }
                  }}
                  className="flex-1 bg-transparent text-green-200 outline-none placeholder:text-muted-foreground"
                  placeholder="Type `help` or run cat projects/admitly.md | ask &quot;summarize in one sentence&quot;"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </label>
            </form>

            {historyPreview.length > 0 && (
              <div className="mt-2 text-[11px] font-mono text-muted-foreground">
                history: {historyPreview.join('  ·  ')}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
