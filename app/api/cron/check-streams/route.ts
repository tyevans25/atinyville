import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

// ATEEZ artist ID on stats.fm
const ATEEZ_ARTIST_ID = 164828

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// Helper: Get current week key (YYYY-W##)
function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

export async function GET(request: Request) {
  try {
    // --- Cron auth check ---
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getKSTDate() // Use KST date
    const weekKey = getCurrentWeekKey()
    const cronRunTime = Date.now()

    // --- Keys ---
    const communityDailyKey = `community:daily:${today}` // ANY ATEEZ streams (streaming hub)
    const dailySongGoalKey = `daily:goal:${today}` // SPECIFIC song (homepage)
    const communityWeeklyKey = `community:weekly:${weekKey}` // ANY ATEEZ streams (streaming hub)
    const missionsKey = `daily:missions:${today}`

    // --- Load goals and missions ---
    const [communityDaily, dailySongGoal, communityWeekly, missions] = await Promise.all([
      kv.get<{ target: number; current?: number }>(communityDailyKey),
      kv.get<{ song: string; target: number; current?: number }>(dailySongGoalKey),
      kv.get<{ target: number; current?: number }>(communityWeeklyKey),
      kv.get<Mission[]>(missionsKey)
    ])

    if (!communityDaily && !dailySongGoal && !communityWeekly && (!missions || missions.length === 0)) {
      return NextResponse.json({ success: true, message: "No active goals today" })
    }

    // --- Initialize NEW stream counters (only counting NEW streams this run) ---
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0
    let usersProcessed = 0

    // --- Fetch all users with stats.fm ---
    const userKeys = await kv.keys("user:*:statsfm")
    console.log(`🔍 Debug: Found ${userKeys.length} users:`, JSON.stringify(userKeys))

    for (const key of userKeys) {
      try {
        console.log(`🔄 Processing user key: ${key}`)
        
        const userId = key.split(":")[1]
        console.log(`👤 User ID: ${userId}`)
        
        const statsfmUsername = await kv.get<string>(key)
        console.log(`📝 Stats.fm username: ${statsfmUsername}`)
        
        if (!statsfmUsername) {
          console.log(`❌ No username found, skipping`)
          continue
        }

        // Get the last processed timestamp for this user
        const lastProcessedKey = `user:${userId}:last_processed`
        const lastProcessedTime = await kv.get<number>(lastProcessedKey) || 0
        console.log(`⏰ Last processed: ${lastProcessedTime} (${new Date(lastProcessedTime).toISOString()})`)

        // Fetch user's streams with higher limit
        console.log(`🌐 Fetching streams from stats.fm...`)
        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=50`)
        console.log(`📡 Stats.fm response: ${res.status}`)
        
        if (!res.ok) {
          console.log(`❌ Stats.fm API error, skipping`)
          continue
        }
        
        const data = await res.json()
        const streams: any[] = data.items || []
        console.log(`📊 Total streams fetched: ${streams.length}`)

        // Filter to only NEW streams (after last processed time)
        const newStreams = streams.filter(s => {
          const streamEndTime = new Date(s.endTime).getTime()
          return streamEndTime > lastProcessedTime
        })
        console.log(`🆕 New streams since last run: ${newStreams.length}`)

        if (newStreams.length === 0) {
          console.log(`⏭️ No new streams, skipping`)
          continue
        }

        // --- COMMUNITY DAILY GOAL (ANY ATEEZ streams) ---
        if (communityDaily) {
          const todayNewStreams = newStreams.filter((s) => {
            // Convert stream UTC time to KST for date comparison
            const streamUTC = new Date(s.endTime)
            const streamKST = new Date(streamUTC.getTime() + (9 * 60 * 60 * 1000))
            const streamDate = streamKST.toISOString().split("T")[0]
            const matchesDate = streamDate === today
            const isAteez = s.artistIds?.includes(ATEEZ_ARTIST_ID)
            
            return matchesDate && isAteez
          })

          if (todayNewStreams.length > 0) {
            // Increment user's daily count
            const userDailyKey = `community:daily:user:${userId}:${today}`
            const prevUserDaily = (await kv.get<number>(userDailyKey)) || 0
            await kv.set(userDailyKey, prevUserDaily + todayNewStreams.length, { ex: 86400 })

            newDailyStreams += todayNewStreams.length
          }
        }

        // --- DAILY SONG GOAL (SPECIFIC song - homepage) ---
        if (dailySongGoal) {
          const todaySongStreams = newStreams.filter((s) => {
            // Convert stream UTC time to KST for date comparison
            const streamUTC = new Date(s.endTime)
            const streamKST = new Date(streamUTC.getTime() + (9 * 60 * 60 * 1000))
            const streamDate = streamKST.toISOString().split("T")[0]
            const matchesDate = streamDate === today
            const matchesSong = s.trackName === dailySongGoal.song
            
            return matchesDate && matchesSong
          })

          if (todaySongStreams.length > 0) {
            // Increment user's daily song count
            const userDailySongKey = `daily:streams:${userId}:${today}`
            const prevUserDailySong = (await kv.get<number>(userDailySongKey)) || 0
            await kv.set(userDailySongKey, prevUserDailySong + todaySongStreams.length, { ex: 86400 })

            newDailySongStreams += todaySongStreams.length
          }
        }

        // --- COMMUNITY WEEKLY GOAL (ANY ATEEZ streams) ---
        if (communityWeekly) {
          // Use KST for week calculation
          const nowKST = new Date(new Date().getTime() + (9 * 60 * 60 * 1000))
          const dayOfWeek = nowKST.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const startOfWeek = new Date(nowKST)
          startOfWeek.setDate(nowKST.getDate() - daysToMonday)
          startOfWeek.setHours(0, 0, 0, 0)

          const weekNewStreams = newStreams.filter((s) => {
            // Convert stream UTC time to KST
            const streamUTC = new Date(s.endTime)
            const streamKST = new Date(streamUTC.getTime() + (9 * 60 * 60 * 1000))
            const matchesWeek = streamKST >= startOfWeek
            const isAteez = s.artistIds?.includes(ATEEZ_ARTIST_ID)
            
            return matchesWeek && isAteez
          })

          if (weekNewStreams.length > 0) {
            const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
            const prevUserWeekly = (await kv.get<number>(userWeeklyKey)) || 0
            await kv.set(userWeeklyKey, prevUserWeekly + weekNewStreams.length, { ex: 604800 })

            newWeeklyStreams += weekNewStreams.length
          }
        }

        // --- INDIVIDUAL MISSIONS (specific songs) ---
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionNewStreams = newStreams.filter((s) => {
              // Convert stream UTC time to KST for date comparison
              const streamUTC = new Date(s.endTime)
              const streamKST = new Date(streamUTC.getTime() + (9 * 60 * 60 * 1000))
              const streamDate = streamKST.toISOString().split("T")[0]
              // Match by trackId instead of trackName for perfect accuracy!
              return streamDate === today && s.trackId === mission.trackId
            })

            if (missionNewStreams.length > 0) {
              const missionKey = `mission:progress:${userId}:${today}:${mission.id}`
              const prevMission = (await kv.get<number>(missionKey)) || 0
              await kv.set(missionKey, prevMission + missionNewStreams.length, { ex: 86400 })
            }
          }
        }

        // Update last processed timestamp for this user
        await kv.set(lastProcessedKey, cronRunTime, { ex: 604800 }) // 7 day expiry

        usersProcessed++
      } catch (err) {
        console.error(`Error processing user ${key}:`, err)
      }
    }

    // --- ACCUMULATE (ADD) TO COMMUNITY DAILY GOAL TOTAL (ANY ATEEZ) ---
    console.log(`📊 Accumulation check - communityDaily exists: ${!!communityDaily}, newDailyStreams: ${newDailyStreams}`)
    if (communityDaily && newDailyStreams > 0) {
      const updatedCurrent = (communityDaily.current || 0) + newDailyStreams
      console.log(`💾 Updating community daily: ${communityDaily.current || 0} + ${newDailyStreams} = ${updatedCurrent}`)
      await kv.set(communityDailyKey, {
        target: communityDaily.target,
        current: updatedCurrent
      }, { ex: 86400 })
      console.log(`✅ Community daily saved: ${updatedCurrent}`)
    }

    // --- ACCUMULATE (ADD) TO DAILY SONG GOAL TOTAL (SPECIFIC SONG - homepage) ---
    console.log(`📊 Song goal check - dailySongGoal exists: ${!!dailySongGoal}, newDailySongStreams: ${newDailySongStreams}`)
    if (dailySongGoal && newDailySongStreams > 0) {
      const updatedCurrent = (dailySongGoal.current || 0) + newDailySongStreams
      console.log(`💾 Updating song goal: ${dailySongGoal.current || 0} + ${newDailySongStreams} = ${updatedCurrent}`)
      await kv.set(dailySongGoalKey, {
        song: dailySongGoal.song,
        target: dailySongGoal.target,
        current: updatedCurrent
      }, { ex: 86400 })
      console.log(`✅ Song goal saved: ${updatedCurrent}`)
    }

    // --- ACCUMULATE (ADD) TO COMMUNITY WEEKLY GOAL TOTAL ---
    console.log(`📊 Weekly check - communityWeekly exists: ${!!communityWeekly}, newWeeklyStreams: ${newWeeklyStreams}`)
    if (communityWeekly && newWeeklyStreams > 0) {
      const updatedCurrent = (communityWeekly.current || 0) + newWeeklyStreams
      console.log(`💾 Updating weekly: ${communityWeekly.current || 0} + ${newWeeklyStreams} = ${updatedCurrent}`)
      await kv.set(communityWeeklyKey, {
        target: communityWeekly.target,
        current: updatedCurrent
      }, { ex: 604800 })
      console.log(`✅ Weekly saved: ${updatedCurrent}`)
    }

    // --- COMMUNITY MISSIONS TOTALS (recalculate from individual progress) ---
    if (missions && missions.length > 0) {
      for (const mission of missions) {
        let missionTotal = 0
        for (const key of userKeys) {
          const userId = key.split(":")[1]
          const count = (await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`)) || 0
          missionTotal += count
        }
        await kv.set(`mission:community:${today}:${mission.id}`, missionTotal, { ex: 86400 })
      }
    }

    console.log(`✅ Cron done: ${usersProcessed} users, +${newDailyStreams} community daily, +${newDailySongStreams} song daily, +${newWeeklyStreams} community weekly`)

    return NextResponse.json({
      success: true,
      usersProcessed,
      newDailyStreams,
      newDailySongStreams,
      newWeeklyStreams,
      missionsCount: missions?.length || 0,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}