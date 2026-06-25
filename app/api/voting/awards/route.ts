import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

const SHEET_ID = process.env.VOTING_SHEET_ID
const SHEET_URL = SHEET_ID
  ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=`
  : null

// ── Sheet tab names ────────────────────────────────────────────
const TABS = {
  campaigns:    'Campaigns',
  nominations:  'Nominations',
  sources:      'VoteSources',
  multipliers:  'MultiplierDays',
}

async function fetchSheet(tab: string) {
  if (!SHEET_URL) return []
  try {
    const res = await fetch(`${SHEET_URL}${encodeURIComponent(tab)}`, {
      next: { revalidate: 300 } // 5 min cache
    })
    if (!res.ok) return []
    const csv = await res.text()
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
    return data as Record<string, string>[]
  } catch {
    return []
  }
}

export async function GET() {
  try {
    // If no sheet configured, return placeholder shape
    if (!SHEET_URL) {
      return NextResponse.json({
        campaigns: [],
        nominations: [],
        sources: [],
        multiplierDays: [],
        socialStats: {},
        error: 'VOTING_SHEET_ID not configured',
      })
    }

    // Fetch all sheet tabs in parallel
    const [campaigns, nominations, sources, multipliers] = await Promise.all([
      fetchSheet(TABS.campaigns),
      fetchSheet(TABS.nominations),
      fetchSheet(TABS.sources),
      fetchSheet(TABS.multipliers),
    ])

    // For each source, fetch Redis stats
    const socialStats: Record<string, {
      total: number
      lastFetchedAt: string | null
      dailyStats: Array<{ date: string; count: number; newComments: number }>
    }> = {}

    for (const source of sources) {
      const id = source['SourceID']?.trim()
      if (!id) continue

      const total = await kv.get<number>(`voting:total:${id}`) ?? 0
      const lastFetch = await kv.get<string>(`voting:lastfetch:${id}`)

      // Get daily stats for last 30 days
      const keys = await kv.keys(`voting:daily:${id}:*`)
      const daily = []
      for (const key of keys.sort()) {
        const val = await kv.get<{ count: number; fetchedAt: string; newComments: number }>(key)
        if (val) {
          daily.push({ date: key.split(':').pop()!, ...val })
        }
      }

      socialStats[id] = {
        total,
        lastFetchedAt: lastFetch ?? null,
        dailyStats: daily.slice(-30),
      }
    }

    return NextResponse.json({
      campaigns,
      nominations,
      sources,
      multiplierDays: multipliers,
      socialStats,
    })
  } catch (error) {
    console.error('Awards route error:', error)
    return NextResponse.json({ error: 'Failed to load voting data' }, { status: 500 })
  }
}