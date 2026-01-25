import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get top 20 scores (sorted by score, descending)
    const topScores = await kv.zrange('leaderboard', 0, 19, {
      rev: true,
      withScores: true
    })

    // Format the response
    const leaderboard = []
    for (let i = 0; i < topScores.length; i += 2) {
      leaderboard.push({
        rank: (i / 2) + 1,
        username: topScores[i],
        score: topScores[i + 1]
      })
    }

    return NextResponse.json({ leaderboard })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
