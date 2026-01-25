import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, score } = await request.json()

    // Validate input
    if (!username || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Username and score are required' },
        { status: 400 }
      )
    }

    // Clean username (lowercase, trim)
    const cleanUsername = username.toLowerCase().trim()

    // Get today's date (YYYY-MM-DD format)
    const today = new Date().toISOString().split('T')[0]
    const playKey = `played:${cleanUsername}:${today}`

    // Check if user already played today
    const hasPlayed = await kv.get(playKey)
    if (hasPlayed) {
      return NextResponse.json(
        { error: 'You already played today! Come back tomorrow.' },
        { status: 403 }
      )
    }

    // Get user's current best score
    const currentBestKey = `score:${cleanUsername}`
    const currentBest = await kv.get<number>(currentBestKey)

    // Only save if it's their best score
    if (!currentBest || score > currentBest) {
      await kv.set(currentBestKey, score)
      
      // Add to sorted leaderboard (sorted set by score)
      await kv.zadd('leaderboard', {
        score: score,
        member: cleanUsername
      })
    }

    // Mark that they played today (expires in 24 hours)
    await kv.set(playKey, true, { ex: 86400 })

    // Get user's rank
    const rank = await kv.zrevrank('leaderboard', cleanUsername)

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
