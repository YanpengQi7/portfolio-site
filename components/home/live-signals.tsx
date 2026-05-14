'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ElementType } from 'react'
import Image from 'next/image'
import {
  Activity,
  BookOpen,
  CloudSun,
  Code2,
  Footprints,
  Headphones,
  Radio,
} from 'lucide-react'

type LiveData = {
  updatedAt: string
  music: {
    configured: boolean
    isPlaying: boolean
    source: string
    title: string
    artist: string
    album: string
    albumArt: string | null
    url: string | null
    progressMs: number
    durationMs: number
    playedAt?: string | null
  }
  coding: {
    configured: boolean
    codingTime: string
    totalSeconds: number
    topCategory: string
    linesChanged: string
  }
  weather: {
    city: string
    temperature: number | null
    humidity: number | null
    windMph: number | null
    condition: string
  }
  clock: {
    timeZone: string
    time: string
    date: string
  }
  body: {
    steps: string
    reading: string
  }
}

const fallbackData: LiveData = {
  updatedAt: new Date().toISOString(),
  music: {
    configured: false,
    isPlaying: false,
    source: 'Last.fm',
    title: 'Live feed warming up',
    artist: 'Last.fm connects here',
    album: 'Now Playing',
    albumArt: null,
    url: null,
    progressMs: 0,
    durationMs: 0,
    playedAt: null,
  },
  coding: {
    configured: false,
    codingTime: 'API pending',
    totalSeconds: 0,
    topCategory: 'coding',
    linesChanged: 'WakaTime',
  },
  weather: {
    city: 'Seattle',
    temperature: null,
    humidity: null,
    windMph: null,
    condition: 'Live weather',
  },
  clock: {
    timeZone: 'America/Los_Angeles',
    time: '--:--',
    date: 'Today',
  },
  body: {
    steps: 'Health API pending',
    reading: 'Designing Data-Intensive Applications',
  },
}

const panelStyle: CSSProperties = {
  border: '0.5px solid var(--rule)',
  background: 'var(--bg-card)',
  boxShadow: 'var(--shadow-card)',
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'syncing'

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

function progressPercent(progressMs: number, durationMs: number) {
  if (!durationMs) return 12
  return Math.min(100, Math.max(0, Math.round((progressMs / durationMs) * 100)))
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: ElementType
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="live-metric" style={panelStyle}>
      <div className="live-metric__icon" aria-hidden>
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div>
        <div className="live-metric__label">{label}</div>
        <div className="live-metric__value">{value}</div>
        <div className="live-metric__detail">{detail}</div>
      </div>
    </div>
  )
}

function Spectrum({ active }: { active: boolean }) {
  return (
    <div className={active ? 'live-spectrum is-active' : 'live-spectrum'} aria-hidden>
      {[34, 58, 42, 76, 48, 64, 36, 70, 52, 44, 62, 38].map((height, index) => (
        <span
          key={`${height}-${index}`}
          style={{
            height: `${height}%`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default function LiveSignals() {
  const [data, setData] = useState<LiveData>(fallbackData)
  const [status, setStatus] = useState<'loading' | 'live' | 'stale'>('loading')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/live', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Live API returned ${res.status}`)
        const next = (await res.json()) as LiveData
        if (!cancelled) {
          setData(next)
          setStatus('live')
        }
      } catch {
        if (!cancelled) setStatus('stale')
      }
    }

    load()
    const timer = window.setInterval(load, 30000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const updatedAt = useMemo(() => formatUpdatedAt(data.updatedAt), [data.updatedAt])
  const musicProgress = progressPercent(data.music.progressMs, data.music.durationMs)
  const weatherValue =
    data.weather.temperature === null ? '--' : `${data.weather.temperature}°F`

  return (
    <section className="live-signals-section" aria-labelledby="live-signals-title">
      <div className="live-signals-shell">
        <div className="live-signals-copy">
          <div className="live-eyebrow">
            <Radio size={14} strokeWidth={1.8} />
            Live signals
          </div>
          <h2 id="live-signals-title">A small telemetry panel for a real person.</h2>
          <p>
            Music, code, weather, time, movement, and reading. The useful kind of
            cyberlife: ambient, current, and easy to replace with better sources.
          </p>
          <div className={status === 'live' ? 'live-status is-live' : 'live-status'}>
            <span aria-hidden />
            {status === 'loading'
              ? 'Syncing live APIs'
              : status === 'live'
                ? `Synced ${updatedAt}`
                : 'Showing last known state'}
          </div>
        </div>

        <div className="live-panel" style={panelStyle}>
          <div className="live-now">
            <div className="live-album">
              {data.music.albumArt ? (
                <Image
                  src={data.music.albumArt}
                  alt=""
                  fill
                  sizes="116px"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <Headphones size={36} strokeWidth={1.4} />
              )}
            </div>
            <div className="live-track">
              <div className="live-track__meta">
                <span>{data.music.isPlaying ? 'Scrobbling now' : 'Last scrobble'}</span>
                <span>{data.music.configured ? data.music.source : 'Source pending'}</span>
              </div>
              <h3>{data.music.title}</h3>
              <p>{data.music.artist}</p>
              <div className="live-progress" aria-hidden>
                <span style={{ width: `${musicProgress}%` }} />
              </div>
            </div>
            <Spectrum active={data.music.isPlaying} />
          </div>

          <div className="live-metrics-grid">
            <Metric
              icon={Code2}
              label="Code today"
              value={data.coding.codingTime}
              detail={`${data.coding.linesChanged} · ${data.coding.topCategory}`}
            />
            <Metric
              icon={CloudSun}
              label={data.weather.city}
              value={weatherValue}
              detail={`${data.weather.condition}${data.weather.humidity === null ? '' : ` · ${data.weather.humidity}% humidity`}`}
            />
            <Metric
              icon={Activity}
              label={data.clock.date}
              value={data.clock.time}
              detail={data.clock.timeZone.replace('_', ' ')}
            />
            <Metric
              icon={Footprints}
              label="Movement"
              value={data.body.steps}
              detail="ready for Health/Fitbit"
            />
            <Metric
              icon={BookOpen}
              label="Reading"
              value={data.body.reading}
              detail="currently on the desk"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
