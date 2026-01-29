import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Helper: Get current date in KST
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// Helper: Get current week key
function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

export async function GET() {
  try {
    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    
    // Get all goal keys
    const communityDailyKey = `community:daily:${today}`
    const dailySongGoalKey = `daily:goal:${today}`
    const communityWeeklyKey = `community:weekly:${weekKey}`
    
    // Fetch all goals
    const [communityDaily, dailySongGoal, communityWeekly] = await Promise.all([
      kv.get(communityDailyKey),
      kv.get(dailySongGoalKey),
      kv.get(communityWeeklyKey)
    ])
    
    // Calculate days in current week (for verification)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - daysToMonday)
    
    // Get daily totals for each day this week
    const dailyTotals = []
    let weekSum = 0
    
    for (let i = 0; i <= daysToMonday; i++) {
      const checkDate = new Date(startOfWeek)
      checkDate.setDate(startOfWeek.getDate() + i)
      const dateStr = checkDate.toISOString().split('T')[0]
      const dayKey = `community:daily:${dateStr}`
      const dayData = await kv.get<{ target: number; current: number }>(dayKey)
      
      const dayTotal = dayData?.current || 0
      weekSum += dayTotal
      
      dailyTotals.push({
        date: dateStr,
        dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][checkDate.getDay()],
        total: dayTotal
      })
    }
    
    return NextResponse.json({
      today,
      weekKey,
      goals: {
        communityDaily: communityDaily || { message: 'Not set' },
        dailySongGoal: dailySongGoal || { message: 'Not set' },
        communityWeekly: communityWeekly || { message: 'Not set' }
      },
      weekBreakdown: {
        dailyTotals,
        sumOfDailyGoals: weekSum,
        weeklyGoalCurrent: (communityWeekly as any)?.current || 0,
        match: weekSum === ((communityWeekly as any)?.current || 0)
      }
    })
  } catch (error) {
    console.error('Error fetching debug goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}