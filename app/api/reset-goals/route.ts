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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resetType } = body // 'daily', 'weekly', 'all', 'last_processed'
    
    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    
    let deleted = []
    
    if (resetType === 'daily' || resetType === 'all') {
      // Delete today's daily goals
      await kv.del(`community:daily:${today}`)
      await kv.del(`daily:goal:${today}`)
      await kv.del(`daily:missions:${today}`)
      deleted.push(`community:daily:${today}`, `daily:goal:${today}`, `daily:missions:${today}`)
      
      // Delete user daily progress
      const userKeys = await kv.keys("user:*:statsfm")
      for (const key of userKeys) {
        const userId = key.split(":")[1]
        await kv.del(`community:daily:user:${userId}:${today}`)
        await kv.del(`daily:streams:${userId}:${today}`)
        deleted.push(`community:daily:user:${userId}:${today}`, `daily:streams:${userId}:${today}`)
      }
    }
    
    if (resetType === 'weekly' || resetType === 'all') {
      // Delete weekly goal
      await kv.del(`community:weekly:${weekKey}`)
      deleted.push(`community:weekly:${weekKey}`)
      
      // Delete user weekly progress
      const userKeys = await kv.keys("user:*:statsfm")
      for (const key of userKeys) {
        const userId = key.split(":")[1]
        await kv.del(`community:weekly:user:${userId}:${weekKey}`)
        deleted.push(`community:weekly:user:${userId}:${weekKey}`)
      }
    }
    
    if (resetType === 'last_processed' || resetType === 'all') {
      // Delete last_processed timestamps
      const userKeys = await kv.keys("user:*:statsfm")
      for (const key of userKeys) {
        const userId = key.split(":")[1]
        await kv.del(`user:${userId}:last_processed`)
        deleted.push(`user:${userId}:last_processed`)
      }
    }
    
    return NextResponse.json({
      success: true,
      resetType,
      deleted: deleted.length,
      keys: deleted,
      message: `Reset ${resetType} goals successfully`
    })
  } catch (error) {
    console.error('Error resetting goals:', error)
    return NextResponse.json(
      { error: 'Failed to reset goals' },
      { status: 500 }
    )
  }
}