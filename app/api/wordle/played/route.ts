import { NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// GET /api/wordle/played?userId=xxx&date=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")
  const date = searchParams.get("date")
  if (!userId || !date) return NextResponse.json({ played: false })

  try {
    const key = `wordle:${userId}:${date}`
    const session = await kv.get<{ won: boolean; guesses: number; grid: any }>(key)
    if (!session) return NextResponse.json({ played: false })
    return NextResponse.json({ played: true, won: session.won, guesses: session.guesses, grid: session.grid ?? null })
  } catch {
    return NextResponse.json({ played: false })
  }
}

// POST /api/wordle/stats (handles both stats update and session save)
// This is called by the component on game end
export async function POST(req: NextRequest) {
  try {
    const { userId, win, guesses, date, grid, won } = await req.json()
    if (!userId || !date) return NextResponse.json({ ok: false })

    // Save session with grid snapshot so we can restore it
    const sessionKey = `wordle:${userId}:${date}`
    await kv.set(sessionKey, { won: won ?? win, guesses, grid: grid ?? null }, { ex: 60 * 60 * 48 }) // keep 48h

    // Update cumulative stats
    const statsKey = `wordle:stats:${userId}`
    const existing = await kv.get<{ played: number; won: number; streak: number; best: number; lastDate: string; dist: Record<string, number> }>(statsKey) ?? { played: 0, won: 0, streak: 0, best: 0, lastDate: "", dist: {} }

    existing.played++
    if (win) {
      existing.won++
      // Streak: check if yesterday was also played
      const yesterday = new Date(date)
      yesterday.setDate(yesterday.getDate() - 1)
      const yKey = yesterday.toISOString().slice(0, 10)
      if (existing.lastDate === yKey) {
        existing.streak++
      } else if (existing.lastDate !== date) {
        existing.streak = 1
      }
      existing.best = Math.max(existing.best, existing.streak)
      existing.dist[guesses] = (existing.dist[guesses] || 0) + 1
    } else {
      existing.streak = 0
    }
    existing.lastDate = date

    await kv.set(statsKey, existing)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("wordle stats error", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}