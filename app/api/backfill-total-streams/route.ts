import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Auth commented out for one-time run
    // const authHeader = request.headers.get("authorization")
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const url = new URL(request.url)
    const startIndex = parseInt(url.searchParams.get('start') || '0')
    const batchSize = parseInt(url.searchParams.get('batch') || '20')

    console.log(`🔄 Starting backfill from index ${startIndex}, batch size ${batchSize}...`)

    const userKeys = await kv.keys("user:*:statsfm")
    const totalUsers = userKeys.length
    
    console.log(`📊 Total users found: ${totalUsers}`)

    const batchKeys = userKeys.slice(startIndex, startIndex + batchSize)
    
    if (batchKeys.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users processed!',
        totalUsers,
        completed: true
      })
    }

    let usersProcessed = 0
    let totalStreamsBackfilled = 0
    const results: { userId: string; streams: number; weeksFound: number }[] = []
    const errors: string[] = []

    for (const userKey of batchKeys) {
      try {
        const userId = userKey.split(":")[1]
        
        // Get WEEKLY contribution keys instead of daily
        const userWeeklyKeys = await kv.keys(`community:weekly:user:${userId}:*`)
        
        if (userWeeklyKeys.length === 0) {
          results.push({ userId, streams: 0, weeksFound: 0 })
          continue
        }

        // Batch fetch all weekly values
        const values = await kv.mget<number[]>(...userWeeklyKeys)
        const total = values.reduce((sum, val) => sum + (val || 0), 0)

        if (total > 0) {
          // Overwrite with the correct total from weekly data
          await kv.set(`user:${userId}:total_streams`, total)
          usersProcessed++
          totalStreamsBackfilled += total
          results.push({ userId, streams: total, weeksFound: userWeeklyKeys.length })
          console.log(`✅ User ${userId}: ${total} streams from ${userWeeklyKeys.length} weeks`)
        } else {
          results.push({ userId, streams: 0, weeksFound: userWeeklyKeys.length })
        }
      } catch (error) {
        const errMsg = `Error processing ${userKey}: ${error}`
        console.error(`❌ ${errMsg}`)
        errors.push(errMsg)
        continue
      }
    }

    const nextIndex = startIndex + batchSize
    const hasMore = nextIndex < totalUsers

    return NextResponse.json({
      success: true,
      batch: {
        start: startIndex,
        end: startIndex + batchKeys.length,
        processed: usersProcessed,
        streamsBackfilled: totalStreamsBackfilled
      },
      progress: {
        completed: startIndex + batchKeys.length,
        total: totalUsers,
        percentage: Math.round(((startIndex + batchKeys.length) / totalUsers) * 100)
      },
      hasMore,
      nextUrl: hasMore ? `/api/backfill-total-streams?start=${nextIndex}&batch=${batchSize}` : null,
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error("❌ Backfill error:", error)
    return NextResponse.json({ error: "Backfill failed", details: String(error) }, { status: 500 })
  }
}