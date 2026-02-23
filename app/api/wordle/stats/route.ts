// ── app/api/wordle/stats/route.ts ─────────────────────────────
// GET  /api/wordle/stats?userId=xxx  → returns user stats
// POST /api/wordle/stats             → saves a result + grid snapshot

import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

const redis = Redis.fromEnv()

interface WordleStats {
  played: number
  won: number
  streak: number
  best: number
  dist: Record<string, number>
  lastPlayed?: string
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 })

  const stats = await redis.get<WordleStats>(`wordle:stats:${userId}`)
  return NextResponse.json(stats || { played: 0, won: 0, streak: 0, best: 0, dist: {} })
}

export async function POST(req: NextRequest) {
  const { userId, win, guesses, date, grid, won } = await req.json()
  if (!userId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const statsKey  = `wordle:stats:${userId}`
  const playedKey = `wordle:played:${userId}:${date}`

  const existing = await redis.get<WordleStats>(statsKey) || {
    played: 0, won: 0, streak: 0, best: 0, dist: {}, lastPlayed: ""
  }

  // Prevent double submission for same day
  if (existing.lastPlayed === date) {
    return NextResponse.json({ ok: true, alreadySaved: true })
  }

  existing.played++
  existing.lastPlayed = date

  if (win) {
    existing.won++
    existing.streak++
    existing.best = Math.max(existing.best, existing.streak)
    existing.dist[guesses] = (existing.dist[guesses] || 0) + 1
  } else {
    existing.streak = 0
  }

  await redis.set(statsKey, existing)

  // Save played session WITH grid so played/route.ts can restore it
  await redis.set(
    playedKey,
    { won: won ?? win, guesses, grid: grid ?? null },
    { ex: 60 * 60 * 48 } // 48h expiry
  )

  return NextResponse.json({ ok: true, stats: existing })
}