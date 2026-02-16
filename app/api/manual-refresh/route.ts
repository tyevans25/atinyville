import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import kv from "@vercel/kv"

// Cooldown settings
const MAX_REFRESHES = 3
const COOLDOWN_WINDOW = 15 * 60 * 1000 // 15 minutes in milliseconds

// Tier intervals
const TIER_INTERVALS = {
  free: 60,
  bronze: 30,
  silver: 15,
  gold: 10,
  platinum: 5
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
    await kv.set(cooldownKey, recentRefreshes, { ex: 900 }) // Expire after 15 min

    // Get user tier
    const userTier = await kv.get<string>(`user:${userId}:tier`) || 'free'

    // Get base URL - try multiple sources
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    'https://atinytown.com'

    console.log('🔗 Calling cron at:', `${baseUrl}/api/cron/check-streams`)

    // Trigger manual stream check via cron endpoint
    const response = await fetch(`${baseUrl}/api/cron/check-streams`, {
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
      const errorText = await response.text()
      console.error('Cron call failed:', response.status, errorText)
      throw new Error(`Failed to check streams: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({ 
      success: true,
      message: data.newStreams > 0 
        ? `✅ Found ${data.newStreams} new stream${data.newStreams === 1 ? '' : 's'}!`
        : "No new streams found",
      refreshesRemaining: MAX_REFRESHES - recentRefreshes.length,
      newStreams: data.newStreams || 0,
      nextAutoRefresh: TIER_INTERVALS[userTier as keyof typeof TIER_INTERVALS] || 60
    })

  } catch (error) {
    console.error("Error in manual refresh:", error)
    return NextResponse.json({ 
      error: "Failed to refresh streams",
      message: error instanceof Error ? error.message : "Something went wrong. Please try again."
    }, { status: 500 })
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