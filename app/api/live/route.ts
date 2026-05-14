type SpotifyTokenResponse = {
  access_token?: string
  error?: string
}

type SpotifyNowPlayingResponse = {
  is_playing?: boolean
  progress_ms?: number
  item?: {
    name?: string
    duration_ms?: number
    album?: {
      name?: string
      images?: Array<{ url: string; width?: number; height?: number }>
    }
    artists?: Array<{ name: string }>
    external_urls?: { spotify?: string }
  }
}

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

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_NOW_PLAYING_URL =
  'https://api.spotify.com/v1/me/player/currently-playing'

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

async function fetchSpotifyNowPlaying() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      configured: false,
      isPlaying: false,
      title: 'Connect Spotify',
      artist: 'Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN',
      album: 'Live music source',
      albumArt: null,
      url: null,
      progressMs: 0,
      durationMs: 0,
    }
  }

  const tokenRes = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  })

  if (!tokenRes.ok) {
    throw new Error(`Spotify token request failed: ${tokenRes.status}`)
  }

  const tokenData = (await tokenRes.json()) as SpotifyTokenResponse
  if (!tokenData.access_token) {
    throw new Error(tokenData.error ?? 'Spotify token response missing access_token')
  }

  const nowPlayingRes = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: 'no-store',
  })

  if (nowPlayingRes.status === 204 || nowPlayingRes.status === 202) {
    return {
      configured: true,
      isPlaying: false,
      title: 'Nothing playing',
      artist: 'Spotify is connected',
      album: 'Paused',
      albumArt: null,
      url: null,
      progressMs: 0,
      durationMs: 0,
    }
  }

  if (!nowPlayingRes.ok) {
    throw new Error(`Spotify now playing request failed: ${nowPlayingRes.status}`)
  }

  const data = (await nowPlayingRes.json()) as SpotifyNowPlayingResponse
  const albumArt = data.item?.album?.images?.[0]?.url ?? null

  return {
    configured: true,
    isPlaying: Boolean(data.is_playing),
    title: data.item?.name ?? 'Unknown track',
    artist: data.item?.artists?.map(artist => artist.name).join(', ') ?? 'Unknown artist',
    album: data.item?.album?.name ?? 'Unknown album',
    albumArt,
    url: data.item?.external_urls?.spotify ?? null,
    progressMs: data.progress_ms ?? 0,
    durationMs: data.item?.duration_ms ?? 0,
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
    fetchSpotifyNowPlaying(),
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
            title: 'Music signal unavailable',
            artist: music.reason instanceof Error ? music.reason.message : 'Unable to reach source',
            album: 'Spotify',
            albumArt: null,
            url: null,
            progressMs: 0,
            durationMs: 0,
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
