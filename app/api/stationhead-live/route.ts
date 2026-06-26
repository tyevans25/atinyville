import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { STATIONS } from '@/lib/stationhead-stations'

export async function GET() {
  // Read manual live overrides from KV
  const keys = STATIONS.map(s => `stationhead:manual:live:${s.username}`)
  let manualLive: Set<string> = new Set()
  try {
    const values = await kv.mget<boolean[]>(...keys)
    STATIONS.forEach((s, i) => { if (values[i]) manualLive.add(s.username) })
  } catch {}

  const stations = STATIONS.map(s => ({
    ...s,
    isLive: manualLive.has(s.username),
    listenerCount: 0,
  }))

  const isLive = stations.some(s => s.isLive)
  const totalListeners = 0

  return NextResponse.json({ stations, isLive, totalListeners })
}