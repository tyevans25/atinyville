import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

const APIFY_TOKEN = process.env.APIFY_API_TOKEN
// Using the cheaper third-party scraper ($0.50/1k comments)
const ACTOR_ID = 'apidojo~instagram-comments-scraper'

interface ApifyComment {
  text: string
  timestamp?: string
  ownerUsername?: string
}

interface SnapshotData {
  count: number
  fetchedAt: string
  newComments: number
}

// GET — return snapshots for a source (for daily chart)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sourceId = searchParams.get('sourceId')
  if (!sourceId) return NextResponse.json({ error: 'sourceId required' }, { status: 400 })

  try {
    // Get all daily stats for this source
    const keys = await kv.keys(`voting:daily:${sourceId}:*`)
    const stats = []
    for (const key of keys.sort()) {
      const val = await kv.get<SnapshotData>(key)
      if (val) {
        const date = key.split(':').pop()!
        stats.push({ date, ...val })
      }
    }

    // Get current total
    const total = await kv.get<number>(`voting:total:${sourceId}`) ?? 0
    const lastFetch = await kv.get<string>(`voting:lastfetch:${sourceId}`)

    return NextResponse.json({ stats, total, lastFetchedAt: lastFetch })
  } catch (error) {
    console.error('Error fetching voting stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

// POST — trigger a scrape for a source
export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 })
  }

  const { sourceId, postUrl, hashtag, force } = await req.json()

  if (!sourceId || !postUrl || !hashtag) {
    return NextResponse.json({ error: 'sourceId, postUrl, hashtag required' }, { status: 400 })
  }

  try {
    // Rate limit — don't re-scrape within 30 min unless forced
    const lastFetch = await kv.get<string>(`voting:lastfetch:${sourceId}`)
    if (lastFetch && !force) {
      const msSince = Date.now() - new Date(lastFetch).getTime()
      if (msSince < 30 * 60 * 1000) {
        return NextResponse.json({ error: 'Rate limited — scraped recently', lastFetchedAt: lastFetch }, { status: 429 })
      }
    }

    // Get timestamp of last scrape to only fetch new comments
    const lastFetchTs = lastFetch ? new Date(lastFetch).toISOString() : undefined

    // Start Apify actor run
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls: [postUrl],
          maxComments: 500, // cap per cron run — adjust as needed
          ...(lastFetchTs ? { since: lastFetchTs } : {}),
        }),
      }
    )

    if (!runRes.ok) {
      const err = await runRes.text()
      console.error('Apify run failed:', err)
      return NextResponse.json({ error: 'Failed to start Apify run' }, { status: 500 })
    }

    const run = await runRes.json()
    const runId = run.data?.id

    if (!runId) {
      return NextResponse.json({ error: 'No run ID returned from Apify' }, { status: 500 })
    }

    // Poll for completion (max 2 min)
    let attempts = 0
    let status = 'RUNNING'
    while (status === 'RUNNING' && attempts < 24) {
      await new Promise(r => setTimeout(r, 5000))
      const statusRes = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}?token=${APIFY_TOKEN}`
      )
      const statusData = await statusRes.json()
      status = statusData.data?.status ?? 'FAILED'
      attempts++
    }

    if (status !== 'SUCCEEDED') {
      return NextResponse.json({ error: `Apify run ended with status: ${status}` }, { status: 500 })
    }

    // Fetch results
    const resultsRes = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}/dataset/items?token=${APIFY_TOKEN}`
    )
    const comments: ApifyComment[] = await resultsRes.json()

    // Count comments containing the hashtag (case-insensitive)
    const tag = hashtag.toLowerCase()
    const matchCount = comments.filter(c =>
      c.text?.toLowerCase().includes(tag)
    ).length

    // Update running total
    const prevTotal = await kv.get<number>(`voting:total:${sourceId}`) ?? 0
    const newTotal = prevTotal + matchCount
    await kv.set(`voting:total:${sourceId}`, newTotal)

    // Store daily snapshot (KST)
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    const kstDate = kst.toISOString().split('T')[0]
    const dayKey = `voting:daily:${sourceId}:${kstDate}`
    const existing = await kv.get<SnapshotData>(dayKey)
    await kv.set(dayKey, {
      count: (existing?.count ?? 0) + matchCount,
      fetchedAt: new Date().toISOString(),
      newComments: (existing?.newComments ?? 0) + comments.length,
    }, { ex: 60 * 60 * 24 * 60 }) // 60 day TTL

    // Store last fetch timestamp
    await kv.set(`voting:lastfetch:${sourceId}`, new Date().toISOString())

    return NextResponse.json({
      success: true,
      newComments: comments.length,
      hashtagMatches: matchCount,
      runningTotal: newTotal,
      date: kstDate,
    })
  } catch (error) {
    console.error('Scrape error:', error)
    return NextResponse.json({ error: 'Scrape failed' }, { status: 500 })
  }
}