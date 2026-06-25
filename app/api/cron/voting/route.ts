import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import Papa from 'papaparse'

// This route is called by Vercel cron every hour
// vercel.json: { "crons": [{ "path": "/api/cron/voting", "schedule": "0 * * * *" }] }

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
const SHEET_ID = process.env.VOTING_SHEET_ID
const ACTOR_ID = 'apidojo~instagram-comments-scraper'

interface VoteSource {
  SourceID: string
  NominationID: string
  Platform: string
  PostURL: string
  Hashtag: string
  Active: string
}

async function fetchSources(): Promise<VoteSource[]> {
  if (!SHEET_ID) return []
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&sheet=VoteSources`
    const res = await fetch(url)
    if (!res.ok) return []
    const csv = await res.text()
    const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true })
    return (data as VoteSource[]).filter(s => s.Active?.toLowerCase() === 'true')
  } catch {
    return []
  }
}

export async function GET(req: Request) {
  // Verify this is called by Vercel cron (in production)
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APIFY_API_TOKEN not set' }, { status: 500 })
  }

  const sources = await fetchSources()
  if (sources.length === 0) {
    return NextResponse.json({ message: 'No active vote sources configured' })
  }

  const results = []

  for (const source of sources) {
    try {
      // Skip if scraped in last 50 min (cron runs hourly, give 10 min buffer)
      const lastFetch = await kv.get<string>(`voting:lastfetch:${source.SourceID}`)
      if (lastFetch) {
        const msSince = Date.now() - new Date(lastFetch).getTime()
        if (msSince < 50 * 60 * 1000) {
          results.push({ sourceId: source.SourceID, skipped: true, reason: 'recent' })
          continue
        }
      }

      // Only fetch comments since last scrape
      const input: Record<string, unknown> = {
        directUrls: [source.PostURL],
        maxComments: 500,
      }
      if (lastFetch) {
        input.since = new Date(lastFetch).toISOString()
      }

      // Start run
      const runRes = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      )

      if (!runRes.ok) {
        results.push({ sourceId: source.SourceID, error: 'Failed to start run' })
        continue
      }

      const run = await runRes.json()
      const runId = run.data?.id
      if (!runId) {
        results.push({ sourceId: source.SourceID, error: 'No run ID' })
        continue
      }

      // Poll for completion
      let status = 'RUNNING'
      let attempts = 0
      while (status === 'RUNNING' && attempts < 24) {
        await new Promise(r => setTimeout(r, 5000))
        const s = await fetch(
          `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}?token=${APIFY_TOKEN}`
        )
        const sd = await s.json()
        status = sd.data?.status ?? 'FAILED'
        attempts++
      }

      if (status !== 'SUCCEEDED') {
        results.push({ sourceId: source.SourceID, error: `Run ended: ${status}` })
        continue
      }

      // Fetch and count
      const itemsRes = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
      )
      const comments: Array<{ text: string }> = await itemsRes.json()

      const tag = source.Hashtag.toLowerCase()
      const matchCount = comments.filter(c => c.text?.toLowerCase().includes(tag)).length

      // Update Redis
      const prevTotal = await kv.get<number>(`voting:total:${source.SourceID}`) ?? 0
      await kv.set(`voting:total:${source.SourceID}`, prevTotal + matchCount)

      const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      const kstDate = kst.toISOString().split('T')[0]
      const dayKey = `voting:daily:${source.SourceID}:${kstDate}`
      const existing = await kv.get<{ count: number; newComments: number }>(dayKey)
      await kv.set(dayKey, {
        count: (existing?.count ?? 0) + matchCount,
        fetchedAt: new Date().toISOString(),
        newComments: (existing?.newComments ?? 0) + comments.length,
      }, { ex: 60 * 60 * 24 * 60 })

      await kv.set(`voting:lastfetch:${source.SourceID}`, new Date().toISOString())

      results.push({
        sourceId: source.SourceID,
        hashtag: source.Hashtag,
        newComments: comments.length,
        hashtagMatches: matchCount,
        runningTotal: prevTotal + matchCount,
      })
    } catch (err) {
      console.error(`Error processing ${source.SourceID}:`, err)
      results.push({ sourceId: source.SourceID, error: String(err) })
    }
  }

  return NextResponse.json({ ran: new Date().toISOString(), results })
}