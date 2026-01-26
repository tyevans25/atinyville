import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify this is actually a cron job (Vercel adds this header)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Get today's goal
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<{
      song: string
      target: number
      current: number
    }>(goalKey)

    if (!goal) {
      console.log('No goal set for today')
      return NextResponse.json({ message: 'No goal set' })
    }

    // Get all users with stats.fm usernames
    const userKeys = await kv.keys('user:*:statsfm')
    
    let totalStreamsToday = 0
    let usersChecked = 0

    for (const key of userKeys) {
      try {
        const userId = key.split(':')[1]
        const statsfmUsername = await kv.get<string>(key)

        if (!statsfmUsername) continue

        // Fetch their streams from stats.fm
        const response = await fetch(
          `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`
        )

        if (!response.ok) continue

        const data = await response.json()

        // Filter for today's streams of the target song
        const todayStreams = data.items.filter((stream: any) => {
          const streamDate = new Date(stream.endTime).toISOString().split('T')[0]
          return streamDate === today && stream.trackName === goal.song
        })

        const userStreamCount = todayStreams.length

        // Save user's stream count
        await kv.set(
          `daily:streams:${userId}:${today}`,
          userStreamCount,
          { ex: 86400 }
        )

        totalStreamsToday += userStreamCount
        usersChecked++

      } catch (error) {
        console.error(`Error checking user ${key}:`, error)
        continue
      }
    }

    // Update goal with new total
    await kv.set(goalKey, {
      song: goal.song,
      target: goal.target,
      current: totalStreamsToday
    }, { ex: 86400 })

    console.log(`Checked ${usersChecked} users, found ${totalStreamsToday} total streams`)

    return NextResponse.json({
      success: true,
      usersChecked,
      totalStreams: totalStreamsToday,
      goal: goal.song,
      progress: `${totalStreamsToday}/${goal.target}`
    })

  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}