import { NextResponse } from 'next/server'

// Add more ATEEZ fan stations here as needed
const STATIONS = [
  { username: 'ateez',            displayName: 'ATEEZ Official',     description: 'Official ATEEZ Stationhead account' },
  { username: 'bluebirdfm',       displayName: 'BlueBird FM',        description: 'Main ATINY streaming station' },
  { username: 'atinymovementarg', displayName: 'ATINY Movement ARG', description: 'ATINY Station — Argentina' },
  { username: 'argentinyfm',      displayName: 'Argentiny FM',       description: 'ATINY Station — Argentina' },
]

export async function GET() {
  const results = await Promise.allSettled(
    STATIONS.map(async (station) => {
      const res = await fetch(`https://stationhead.com/api/station/${station.username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ATINYVilleBot/1.0)' },
        next: { revalidate: 60 },
      })
      if (!res.ok) return { ...station, isLive: false, listenerCount: 0 }
      const data = await res.json()
      return { ...station, isLive: data.isLive || false, listenerCount: data.listenerCount || 0 }
    })
  )

  const stations = results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...STATIONS[i], isLive: false, listenerCount: 0 }
  )

  const isLive = stations.some(s => s.isLive)
  const totalListeners = stations.reduce((sum, s) => sum + s.listenerCount, 0)

  return NextResponse.json({ stations, isLive, totalListeners })
}