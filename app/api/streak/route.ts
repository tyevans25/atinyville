import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Helper: Get current date in KST
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// Helper: Get yesterday's date in KST
function getYesterdayKST(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000))
  return yesterday.toISOString().split('T')[0]
}

// GET: Fetch user's streak data
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const streakKey = `streak:${userId}`
    const lastActiveKey = `streak:${userId}:last_active`
    const longestKey = `streak:${userId}:longest`

    const [currentStreak, lastActive, longestStreak] = await Promise.all([
      kv.get<number>(streakKey) || 0,
      kv.get<string>(lastActiveKey) || null,
      kv.get<number>(longestKey) || 0
    ])

    return NextResponse.json({
      currentStreak: currentStreak || 0,
      lastActive,
      longestStreak: longestStreak || 0
    })

  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
      { status: 500 }
    )
  }
}

// POST: Update streak when all missions complete
export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const today = getKSTDate()
    const yesterday = getYesterdayKST()

    const streakKey = `streak:${userId}`
    const lastActiveKey = `streak:${userId}:last_active`
    const longestKey = `streak:${userId}:longest`

    // Get current data
    const lastActive = await kv.get<string>(lastActiveKey)
    let currentStreak = await kv.get<number>(streakKey) || 0
    let longestStreak = await kv.get<number>(longestKey) || 0

    // Check if already completed today
    if (lastActive === today) {
      return NextResponse.json({
        currentStreak,
        longestStreak,
        message: 'Already completed today'
      })
    }

    // Determine new streak
    if (lastActive === yesterday) {
      // Continue streak
      currentStreak += 1
    } else if (lastActive === null || lastActive < yesterday) {
      // Start new streak (broke previous streak or first time)
      currentStreak = 1
    }

    // Update longest if needed
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
      await kv.set(longestKey, longestStreak)
    }

    // Save new streak data
    await kv.set(streakKey, currentStreak)
    await kv.set(lastActiveKey, today)

    return NextResponse.json({
      currentStreak,
      longestStreak,
      isNewRecord: currentStreak === longestStreak && currentStreak > 1
    })

  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    )
  }
}