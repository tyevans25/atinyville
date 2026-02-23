// ── app/api/wordle/stats/route.ts ─────────────────────────────
// GET  /api/wordle/stats?userId=xxx  → returns user stats
// POST /api/wordle/stats             → saves a result

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
  const { userId, win, guesses, date } = await req.json()
  if (!userId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const key = `wordle:stats:${userId}`
  const existing = await redis.get<WordleStats>(key) || { played: 0, won: 0, streak: 0, best: 0, dist: {}, lastPlayed: "" }

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

  await redis.set(key, existing)

  // Also mark as played for today
  await redis.set(`wordle:played:${userId}:${date}`, true, { ex: 60 * 60 * 48 }) // expires after 48h

  return NextResponse.json({ ok: true, stats: existing })
}