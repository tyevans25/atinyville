import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import kv from "@vercel/kv"

// Cooldown settings
const MAX_REFRESHES = 3
const COOLDOWN_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds

// Tier-based auto-refresh intervals (in minutes)
const TIER_INTERVALS = {
  free: 60,      // 1 hour
  bronze: 30,    // 30 minutes
  silver: 15,    // 15 minutes
  gold: 10,      // 10 minutes
  platinum: 5    // 5 minutes
}

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check cooldown
    const cooldownKey = `refresh:cooldown:${userId}`
    const refreshes = await kv.get<number[]>(cooldownKey) || []
    
    const now = Date.now()
    const recentRefreshes = refreshes.filter(time => now - time < COOLDOWN_WINDOW)
    
    if (recentRefreshes.length >= MAX_REFRESHES) {
      const oldestRefresh = Math.min(...recentRefreshes)
      const timeUntilReset = COOLDOWN_WINDOW - (now - oldestRefresh)
      const minutesRemaining = Math.ceil(timeUntilReset / 60000)
      
      return NextResponse.json({ 
        error: "Too many refresh attempts",
        message: `Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before refreshing again`,
        remainingTime: timeUntilReset,
        refreshesRemaining: 0
      }, { status: 429 })
    }

    // Add current refresh to list
    recentRefreshes.push(now)
    await kv.set(cooldownKey, recentRefreshes, { ex: 300 }) // Expire after 5 min

    // Get user tier
    const userTier = await kv.get<string>(`user:${userId}:tier`) || 'free'

    // Trigger manual stream check
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/check-streams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({
        userId: userId,
        manual: true,
        tier: userTier
      })
    })

    if (!response.ok) {
      throw new Error('Failed to check streams')
    }

    const data = await response.json()

    return NextResponse.json({ 
      success: true,
      message: "Streams refreshed successfully!",
      refreshesRemaining: MAX_REFRESHES - recentRefreshes.length,
      newStreams: data.newStreams || 0,
      nextAutoRefresh: TIER_INTERVALS[userTier as keyof typeof TIER_INTERVALS] || 60
    })

  } catch (error) {
    console.error("Error in manual refresh:", error)
    return NextResponse.json({ error: "Failed to refresh streams" }, { status: 500 })
  }
}

// GET endpoint to check cooldown status
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cooldownKey = `refresh:cooldown:${userId}`
    const refreshes = await kv.get<number[]>(cooldownKey) || []
    
    const now = Date.now()
    const recentRefreshes = refreshes.filter(time => now - time < COOLDOWN_WINDOW)
    
    const refreshesRemaining = MAX_REFRESHES - recentRefreshes.length
    
    let timeUntilNextRefresh = 0
    if (refreshesRemaining === 0 && recentRefreshes.length > 0) {
      const oldestRefresh = Math.min(...recentRefreshes)
      timeUntilNextRefresh = COOLDOWN_WINDOW - (now - oldestRefresh)
    }

    const userTier = await kv.get<string>(`user:${userId}:tier`) || 'free'

    return NextResponse.json({
      refreshesRemaining,
      maxRefreshes: MAX_REFRESHES,
      cooldownWindow: COOLDOWN_WINDOW,
      timeUntilNextRefresh,
      tier: userTier,
      autoRefreshInterval: TIER_INTERVALS[userTier as keyof typeof TIER_INTERVALS] || 60
    })

  } catch (error) {
    console.error("Error checking cooldown:", error)
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}