// ── app/api/wordle/played/route.ts ────────────────────────────
// GET  /api/wordle/played?userId=xxx&date=YYYY-MM-DD
//      → { played, won, guesses, grid }

import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

const redis = Redis.fromEnv()

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  const date   = req.nextUrl.searchParams.get("date")
  if (!userId || !date) return NextResponse.json({ played: false })

  try {
    // Key must match what stats/route.ts writes
    const session = await redis.get<{ won: boolean; guesses: number; grid: any }>(
      `wordle:played:${userId}:${date}`
    )
    if (!session) return NextResponse.json({ played: false })
    return NextResponse.json({
      played: true,
      won:    session.won,
      guesses: session.guesses,
      grid:   session.grid ?? null,
    })
  } catch {
    return NextResponse.json({ played: false })
  }
}