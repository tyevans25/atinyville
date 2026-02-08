import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// ONE-TIME BACKFILL SCRIPT
// Run this once to populate total_streams for all users based on their daily contributions

export async function GET(request: Request) {
  try {
    // Auth check - only allow if you have the secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log('🔄 Starting total_streams backfill...')

    // Get all users
    const userKeys = await kv.keys("user:*:statsfm")
    let usersProcessed = 0
    let totalStreamsBackfilled = 0

    for (const userKey of userKeys) {
      try {
        const userId = userKey.split(":")[1]
        
        // Get all daily contribution keys for this user
        const userDailyKeys = await kv.keys(`community:daily:user:${userId}:*`)
        
        if (userDailyKeys.length === 0) {
          console.log(`  ⏭️  User ${userId}: No daily contributions found`)
          continue
        }

        // Sum up all their daily streams
        let total = 0
        for (const dailyKey of userDailyKeys) {
          const streams = await kv.get<number>(dailyKey) || 0
          total += streams
        }

        if (total > 0) {
          // Set their total_streams
          await kv.set(`user:${userId}:total_streams`, total)
          console.log(`  ✅ User ${userId}: Backfilled ${total} streams (from ${userDailyKeys.length} days)`)
          usersProcessed++
          totalStreamsBackfilled += total
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userKey}:`, error)
        continue
      }
    }

    console.log(`🎉 Backfill complete!`)
    console.log(`   Users processed: ${usersProcessed}`)
    console.log(`   Total streams backfilled: ${totalStreamsBackfilled}`)

    return NextResponse.json({
      success: true,
      usersProcessed,
      totalStreamsBackfilled,
      message: 'Backfill completed successfully'
    })

  } catch (error) {
    console.error("❌ Backfill error:", error)
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 })
  }
}