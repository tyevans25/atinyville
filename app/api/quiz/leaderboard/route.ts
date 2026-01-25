import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const topScores = await kv.zrange('leaderboard', 0, 19, {
      rev: true,
      withScores: true
    })

    const leaderboard = []
    for (let i = 0; i < topScores.length; i += 2) {
      const userIdAndName = topScores[i] as string
      const username = userIdAndName.split(':')[1] || 'ATINY'
      
      leaderboard.push({
        rank: (i / 2) + 1,
        username: username,
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