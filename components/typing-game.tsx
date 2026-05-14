'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Pause, Play, RotateCcw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type GameStatus = 'idle' | 'running' | 'paused' | 'over'

type FallingWord = {
  id: number
  text: string
  x: number
  y: number
  speed: number
  level: number
}

const WORD_BANK = [
  'react', 'router', 'cache', 'async', 'token', 'prompt', 'vector', 'model',
  'agent', 'server', 'client', 'stream', 'deploy', 'lambda', 'query', 'schema',
  'index', 'search', 'branch', 'commit', 'render', 'state', 'effect', 'hook',
  'typing', 'system', 'memory', 'signal', 'worker', 'canvas', 'layout', 'route',
  'compose', 'dataset', 'cluster', 'pipeline', 'function', 'compiler', 'terminal',
  'workflow', 'feedback', 'optimizer', 'retrieval', 'interface', 'orchestrate',
]

const INITIAL_LIVES = 5
const MAX_LEVEL = 9
const FIELD_HEIGHT_FALLBACK = 460

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getWordForLevel(level: number) {
  const maxLength = Math.min(5 + Math.floor(level / 2), 12)
  const candidates = WORD_BANK.filter(word => word.length <= maxLength)
  return candidates[Math.floor(Math.random() * candidates.length)] ?? WORD_BANK[0]
}

function getSpawnInterval(level: number) {
  return Math.max(620, 1750 - level * 135)
}

function getMultiplier(combo: number) {
  return Math.min(3, 1 + Math.floor(combo / 5) * 0.25)
}

export default function TypingGame() {
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastFrameRef = useRef<number | null>(null)
  const lastSpawnRef = useRef(0)
  const elapsedRef = useRef(0)
  const wordsRef = useRef<FallingWord[]>([])
  const idRef = useRef(0)
  const livesRef = useRef(INITIAL_LIVES)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const levelRef = useRef(1)
  const statusRef = useRef<GameStatus>('idle')

  const [status, setStatus] = useState<GameStatus>('idle')
  const [words, setWords] = useState<FallingWord[]>([])
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [combo, setCombo] = useState(0)
  const [level, setLevel] = useState(1)
  const [highScore, setHighScore] = useState(0)
  const [feedback, setFeedback] = useState<'hit' | 'miss' | null>(null)

  const multiplier = useMemo(() => getMultiplier(combo), [combo])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem('typing-game-high-score')
      setHighScore(stored ? Number(stored) : 0)
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    statusRef.current = status
    if (status === 'running') {
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [status])

  function syncMetrics(next: {
    score?: number
    lives?: number
    combo?: number
    level?: number
  }) {
    if (next.score !== undefined) {
      scoreRef.current = next.score
      setScore(next.score)
    }
    if (next.lives !== undefined) {
      livesRef.current = next.lives
      setLives(next.lives)
    }
    if (next.combo !== undefined) {
      comboRef.current = next.combo
      setCombo(next.combo)
    }
    if (next.level !== undefined) {
      levelRef.current = next.level
      setLevel(next.level)
    }
  }

  function commitWords(nextWords: FallingWord[]) {
    wordsRef.current = nextWords
    setWords(nextWords)
  }

  function endGame(finalScore = scoreRef.current) {
    statusRef.current = 'over'
    setStatus('over')
    commitWords([])
    setInput('')

    setHighScore(previous => {
      const nextHigh = Math.max(previous, finalScore)
      window.localStorage.setItem('typing-game-high-score', String(nextHigh))
      return nextHigh
    })
  }

  function resetGame() {
    elapsedRef.current = 0
    lastFrameRef.current = null
    lastSpawnRef.current = 0
    idRef.current = 0
    commitWords([])
    setInput('')
    syncMetrics({ score: 0, lives: INITIAL_LIVES, combo: 0, level: 1 })
    setFeedback(null)
  }

  function startGame() {
    if (statusRef.current === 'idle' || statusRef.current === 'over') {
      resetGame()
    }
    lastFrameRef.current = null
    statusRef.current = 'running'
    setStatus('running')
  }

  function pauseGame() {
    statusRef.current = 'paused'
    setStatus('paused')
  }

  function spawnWord(levelToUse: number) {
    const rect = fieldRef.current?.getBoundingClientRect()
    const width = rect?.width ?? 760
    const text = getWordForLevel(levelToUse)
    const estimatedWidth = Math.max(78, text.length * 13 + 34)
    const maxX = Math.max(16, width - estimatedWidth - 16)
    const x = Math.floor(16 + Math.random() * (maxX - 16))
    const nextWord: FallingWord = {
      id: idRef.current++,
      text,
      x,
      y: -42,
      speed: 38 + levelToUse * 8 + Math.random() * 18,
      level: levelToUse,
    }

    commitWords([...wordsRef.current, nextWord])
  }

  useEffect(() => {
    if (status !== 'running') {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    function tick(now: number) {
      if (statusRef.current !== 'running') return

      if (lastFrameRef.current === null) {
        lastFrameRef.current = now
        lastSpawnRef.current = now
      }

      const deltaSeconds = Math.min(0.05, (now - lastFrameRef.current) / 1000)
      lastFrameRef.current = now
      elapsedRef.current += deltaSeconds

      const nextLevel = Math.min(MAX_LEVEL, 1 + Math.floor(elapsedRef.current / 18))
      if (nextLevel !== levelRef.current) {
        syncMetrics({ level: nextLevel })
      }

      if (now - lastSpawnRef.current >= getSpawnInterval(levelRef.current)) {
        spawnWord(levelRef.current)
        lastSpawnRef.current = now
      }

      const fieldHeight = fieldRef.current?.clientHeight ?? FIELD_HEIGHT_FALLBACK
      let missed = 0
      const nextWords = wordsRef.current
        .map(word => ({ ...word, y: word.y + word.speed * deltaSeconds }))
        .filter(word => {
          const escaped = word.y > fieldHeight - 24
          if (escaped) missed += 1
          return !escaped
        })

      if (missed > 0) {
        const nextLives = Math.max(0, livesRef.current - missed)
        syncMetrics({ lives: nextLives, combo: 0 })
        setFeedback('miss')
        window.setTimeout(() => setFeedback(null), 180)
        if (nextLives <= 0) {
          endGame()
          return
        }
      }

      commitWords(nextWords)
      animationRef.current = requestAnimationFrame(tick)
    }

    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
    // The game loop reads mutable refs on purpose so animation state is not
    // recreated on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function handleInputChange(value: string) {
    setInput(value)
    const target = normalize(value)
    if (!target) return

    const hitIndex = wordsRef.current.findIndex(word => word.text === target)
    if (hitIndex === -1) return

    const hitWord = wordsRef.current[hitIndex]
    const nextWords = wordsRef.current.filter(word => word.id !== hitWord.id)
    const nextCombo = comboRef.current + 1
    const points = Math.round(10 * hitWord.level * getMultiplier(nextCombo))
    commitWords(nextWords)
    syncMetrics({
      score: scoreRef.current + points,
      combo: nextCombo,
    })
    setInput('')
    setFeedback('hit')
    window.setTimeout(() => setFeedback(null), 160)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && input.trim()) {
      syncMetrics({ combo: 0 })
      setFeedback('miss')
      window.setTimeout(() => setFeedback(null), 160)
    }
  }

  const livesArray = Array.from({ length: INITIAL_LIVES }, (_, index) => index < lives)

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-cyan-300/80">
            Keyboard survival
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Typing Drop
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Type falling words before they cross the floor. Fast hands build combo
            multipliers; missed words cost hearts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'running' ? (
            <Button type="button" variant="secondary" size="lg" onClick={pauseGame}>
              <Pause data-icon="inline-start" />
              Pause
            </Button>
          ) : (
            <Button type="button" size="lg" onClick={startGame}>
              <Play data-icon="inline-start" />
              {status === 'paused' ? 'Resume' : 'Start'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={() => {
            resetGame()
            startGame()
          }}>
            <RotateCcw data-icon="inline-start" />
            Restart
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div
          className={[
            'relative overflow-hidden rounded-2xl border bg-black/35 shadow-2xl shadow-cyan-950/20',
            feedback === 'miss' ? 'border-red-400/70' : 'border-white/10',
          ].join(' ')}
        >
          <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
          <div
            className="absolute inset-x-0 bottom-0 h-20 border-t border-red-300/25 bg-red-500/5"
            aria-hidden
          />
          <div
            className={[
              'absolute right-4 top-4 z-20 rounded-full border px-3 py-1 font-mono text-xs transition-opacity',
              feedback === 'hit'
                ? 'border-cyan-300/50 bg-cyan-300/10 text-cyan-200 opacity-100'
                : 'border-white/10 bg-white/5 text-white/40 opacity-60',
            ].join(' ')}
          >
            x{multiplier.toFixed(2)}
          </div>

          <div
            ref={fieldRef}
            className="relative h-[430px] min-h-[430px] sm:h-[520px]"
            aria-label="Falling word game field"
          >
            {words.map(word => (
              <span
                key={word.id}
                className="absolute rounded-lg border border-cyan-200/25 bg-cyan-300/12 px-3 py-1.5 font-mono text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/25"
                style={{
                  left: word.x,
                  top: word.y,
                  transform: `scale(${1 + Math.min(word.level, 8) * 0.01})`,
                }}
              >
                {word.text}
              </span>
            ))}

            {status !== 'running' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-6 text-center backdrop-blur-sm">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.22em] text-cyan-200/80">
                    {status === 'over' ? 'Game over' : status === 'paused' ? 'Paused' : 'Ready'}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    {status === 'over'
                      ? `Final score: ${score}`
                      : 'Keep your eyes on the falling words.'}
                  </h2>
                  <p className="mt-2 text-sm text-white/60">
                    Best score: {highScore}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Score" value={score} />
              <Metric label="Level" value={level} />
              <Metric label="Combo" value={combo} />
              <Metric label="Best" value={highScore} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Lives</span>
              <div className="flex gap-1.5" aria-label={`${lives} lives remaining`}>
                {livesArray.map((active, index) => (
                  <Heart
                    key={index}
                    className={active ? 'fill-red-400 text-red-400' : 'text-white/20'}
                    size={18}
                  />
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium text-white" htmlFor="typing-input">
              Type here
            </label>
            <input
              ref={inputRef}
              id="typing-input"
              value={input}
              onChange={event => handleInputChange(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status !== 'running'}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 font-mono text-base text-white outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={status === 'running' ? 'match a word' : 'press Start'}
            />
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/60">
              <Zap className="text-cyan-300" size={15} />
              Press Enter on a wrong word to break combo intentionally.
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold text-white">
        {value}
      </div>
    </div>
  )
}
