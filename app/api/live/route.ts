type WakaTimeSummaryResponse = {
  data?: Array<{
    grand_total?: {
      text?: string
      total_seconds?: number
    }
    categories?: Array<{
      name?: string
      text?: string
      total_seconds?: number
    }>
  }>
}

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number
    relative_humidity_2m?: number
    weather_code?: number
    wind_speed_10m?: number
  }
}

type LastFmRecentTracksResponse = {
  recenttracks?: {
    track?: LastFmTrack | LastFmTrack[]
  }
  error?: number
  message?: string
}

type LastFmTrack = {
  name?: string
  artist?: { '#text'?: string; name?: string }
  album?: { '#text'?: string }
  image?: Array<{ '#text'?: string; size?: string }>
  url?: string
  date?: { uts?: string; '#text'?: string }
  '@attr'?: { nowplaying?: string }
}

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/'

const CITY = process.env.LIVE_CITY ?? 'Seattle'
const LATITUDE = process.env.LIVE_LATITUDE ?? '47.6062'
const LONGITUDE = process.env.LIVE_LONGITUDE ?? '-122.3321'
const TIME_ZONE = process.env.LIVE_TIME_ZONE ?? 'America/Los_Angeles'

export const dynamic = 'force-dynamic'

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}

function pickLastFmImage(images?: LastFmTrack['image']) {
  const image = images
    ?.slice()
    .reverse()
    .find(item => item['#text'])

  return image?.['#text'] ?? null
}

async function fetchLastFmNowPlaying() {
  const apiKey = process.env.LASTFM_API_KEY
  const username = process.env.LASTFM_USERNAME

  if (!apiKey || !username) {
    return {
      configured: false,
      isPlaying: false,
      source: 'Last.fm',
      title: 'Connect Last.fm',
      artist: 'Set LASTFM_API_KEY and LASTFM_USERNAME',
      album: 'Recent scrobbles',
      albumArt: null,
      url: null,
      progressMs: 0,
      durationMs: 0,
      playedAt: null,
    }
  }

  const params = new URLSearchParams({
    method: 'user.getrecenttracks',
    user: username,
    api_key: apiKey,
    format: 'json',
    limit: '1',
  })

  const res = await fetch(`${LASTFM_API_URL}?${params}`, {
    headers: {
      'User-Agent': 'yanpengqi.com live signals panel',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Last.fm request failed: ${res.status}`)
  }

  const data = (await res.json()) as LastFmRecentTracksResponse
  if (data.error) {
    throw new Error(data.message ?? `Last.fm error ${data.error}`)
  }

  const tracks = data.recenttracks?.track
  const track = Array.isArray(tracks) ? tracks[0] : tracks

  if (!track) {
    return {
      configured: true,
      isPlaying: false,
      source: 'Last.fm',
      title: 'No scrobbles yet',
      artist: username,
      album: 'Recent tracks',
      albumArt: null,
      url: `https://www.last.fm/user/${encodeURIComponent(username)}`,
      progressMs: 0,
      durationMs: 0,
      playedAt: null,
    }
  }

  const isPlaying = track['@attr']?.nowplaying === 'true'
  const artist = track.artist?.['#text'] ?? track.artist?.name ?? 'Unknown artist'
  const album = track.album?.['#text'] || (isPlaying ? 'Scrobbling now' : 'Last scrobbled')

  return {
    configured: true,
    isPlaying,
    source: 'Last.fm',
    title: track.name ?? 'Unknown track',
    artist,
    album,
    albumArt: pickLastFmImage(track.image),
    url: track.url ?? `https://www.last.fm/user/${encodeURIComponent(username)}`,
    progressMs: 0,
    durationMs: 0,
    playedAt: track.date?.['#text'] ?? null,
  }
}

async function fetchWakaTimeToday() {
  const apiKey = process.env.WAKATIME_API_KEY

  if (!apiKey) {
    return {
      configured: false,
      codingTime: 'Connect WakaTime',
      totalSeconds: 0,
      topCategory: 'coding',
      linesChanged: process.env.LIVE_LINES_TODAY ?? 'API pending',
    }
  }

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const res = await fetch(
    `https://wakatime.com/api/v1/users/current/summaries?start=${today}&end=${today}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error(`WakaTime request failed: ${res.status}`)
  }

  const summary = (await res.json()) as WakaTimeSummaryResponse
  const todayData = summary.data?.[0]
  const topCategory = todayData?.categories?.[0]

  return {
    configured: true,
    codingTime: todayData?.grand_total?.text ?? '0 mins',
    totalSeconds: todayData?.grand_total?.total_seconds ?? 0,
    topCategory: topCategory?.name ?? 'coding',
    linesChanged: process.env.LIVE_LINES_TODAY ?? 'time tracked',
  }
}

function weatherLabel(code?: number) {
  if (code === undefined) return 'Live weather'
  if (code === 0) return 'Clear'
  if ([1, 2, 3].includes(code)) return 'Partly cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Storm'
  return 'Mixed'
}

async function fetchWeather() {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=${encodeURIComponent(TIME_ZONE)}`,
    {
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) {
    throw new Error(`Weather request failed: ${res.status}`)
  }

  const weather = (await res.json()) as OpenMeteoResponse
  const current = weather.current ?? {}

  return {
    city: CITY,
    temperature: current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : null,
    humidity: current.relative_humidity_2m ?? null,
    windMph: current.wind_speed_10m ?? null,
    condition: weatherLabel(current.weather_code),
  }
}

function localClock() {
  const now = new Date()
  return {
    timeZone: TIME_ZONE,
    time: new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now),
    date: new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(now),
  }
}

export async function GET() {
  const settled = await Promise.allSettled([
    fetchLastFmNowPlaying(),
    fetchWakaTimeToday(),
    fetchWeather(),
  ])

  const [music, coding, weather] = settled

  return json({
    updatedAt: new Date().toISOString(),
    music:
      music.status === 'fulfilled'
        ? music.value
        : {
            configured: false,
            isPlaying: false,
            source: 'Last.fm',
            title: 'Music signal unavailable',
            artist: music.reason instanceof Error ? music.reason.message : 'Unable to reach source',
            album: 'Last.fm',
            albumArt: null,
            url: null,
            progressMs: 0,
            durationMs: 0,
            playedAt: null,
          },
    coding:
      coding.status === 'fulfilled'
        ? coding.value
        : {
            configured: false,
            codingTime: 'WakaTime unavailable',
            totalSeconds: 0,
            topCategory: coding.reason instanceof Error ? coding.reason.message : 'coding',
            linesChanged: 'API pending',
          },
    weather:
      weather.status === 'fulfilled'
        ? weather.value
        : {
            city: CITY,
            temperature: null,
            humidity: null,
            windMph: null,
            condition: weather.reason instanceof Error ? weather.reason.message : 'Weather unavailable',
          },
    clock: localClock(),
    body: {
      steps: process.env.LIVE_STEPS_TODAY ?? 'Health API pending',
      reading: process.env.LIVE_READING_NOW ?? 'Designing Data-Intensive Applications',
    },
  })
}
