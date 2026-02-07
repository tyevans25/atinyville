import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

export async function POST(request: Request) {
  try {
    const { userId, username, score } = await request.json()

    if (!userId || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'User ID and score are required' },
        { status: 400 }
      )
    }

    const today = getKSTDate() // Use KST date instead of local
    const playKey = `played:${userId}:${today}`

    // Check if already played
    const hasPlayed = await kv.get(playKey)
    if (hasPlayed) {
      return NextResponse.json(
        { error: 'Already played today' },
        { status: 403 }
      )
    }

    // Get current best score
    const currentBestKey = `score:${userId}`
    const currentBest = await kv.get<number>(currentBestKey)

    // Save if it's their best
    if (!currentBest || score > currentBest) {
      await kv.set(currentBestKey, score)
      
      // Update leaderboard with username for display
      await kv.zadd('leaderboard', {
        score: score,
        member: `${userId}:${username}` // Store both for display
      })
    }

    // Mark as played today (24 hour TTL)
    await kv.set(playKey, true, { ex: 86400 })

    // Get rank
    const rank = await kv.zrevrank('leaderboard', `${userId}:${username}`)

    return NextResponse.json({
      success: true,
      isNewBest: !currentBest || score > currentBest,
      rank: rank !== null ? rank + 1 : null,
      score: score
    })

  } catch (error) {
    console.error('Error submitting score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}