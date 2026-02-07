import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUnlockedBadges, type UserStats } from '@/lib/badge-system'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch all user stats from Redis
    const [
      currentStreak,
      longestStreak,
      totalStreams,
      totalMissionSets,
      communityGoalContributions,
      highestDailyStreams
    ] = await Promise.all([
      kv.get<number>(`streak:${userId}`) || 0,
      kv.get<number>(`streak:${userId}:longest`) || 0,
      kv.get<number>(`user:${userId}:total_streams`) || 0,
      kv.get<number>(`user:${userId}:total_mission_sets`) || 0,
      kv.get<number>(`user:${userId}:community_contributions`) || 0,
      kv.get<number>(`user:${userId}:highest_daily_streams`) || 0
    ])

    const stats: UserStats = {
      currentStreak: currentStreak || 0,
      longestStreak: longestStreak || 0,
      totalStreams: totalStreams || 0,
      totalMissionSets: totalMissionSets || 0,
      communityGoalContributions: communityGoalContributions || 0,
      highestDailyStreams: highestDailyStreams || 0
    }

    // Calculate unlocked badges
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