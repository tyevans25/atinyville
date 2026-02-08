import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUnlockedBadges, type UserStats } from '@/lib/badge-system'

// Helper: Get current date in KST
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const today = getKSTDate()

    const [
      currentStreak,
      longestStreak,
      totalStreams,
      totalMissionSets,
      communityGoalContributions,
      highestDailyStreams,
      todayUserStreams
    ] = await Promise.all([
      kv.get<number>(`streak:${userId}`),
      kv.get<number>(`streak:${userId}:longest`),
      kv.get<number>(`user:${userId}:total_streams`),
      kv.get<number>(`user:${userId}:total_mission_sets`),
      kv.get<number>(`user:${userId}:community_contributions`),
      kv.get<number>(`user:${userId}:highest_daily_streams`),
      kv.get<number>(`community:daily:user:${userId}:${today}`)
    ])

    const todayStreams = todayUserStreams || 0
    const bestDay = Math.max(highestDailyStreams || 0, todayStreams)

    const stats: UserStats = {
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalStreams: totalStreams || 0,
      totalMissionSets: totalMissionSets || 0,
      communityGoalContributions: communityGoalContributions || 0,
      highestDailyStreams: bestDay
    }

    const unlockedBadges = getUnlockedBadges(stats)

    return NextResponse.json({
      stats,
      badges: unlockedBadges
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}