import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

// ATEEZ artist ID on stats.fm
const ATEEZ_ARTIST_ID = 164828

// DEFAULT GOALS
const DEFAULT_COMMUNITY_DAILY = 10000
const DEFAULT_COMMUNITY_WEEKLY = 50000
const DEFAULT_SONG_GOAL_TARGET = 5000

// Helper: Delay to prevent rate limiting
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

// Helper: Get current week key (Thursday-Wednesday weeks in KST)
function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  
  // Get current day of week (0 = Sunday, 4 = Thursday)
  const kstDay = kstNow.getUTCDay()
  
  // Calculate days since last Thursday
  const daysSinceThursday = (kstDay + 7 - 4) % 7
  
  // Get the date of this week's Thursday
  const thisWeekThursday = new Date(kstNow)
  thisWeekThursday.setUTCDate(kstNow.getUTCDate() - daysSinceThursday)
  thisWeekThursday.setUTCHours(0, 0, 0, 0)
  
  // Calculate week number based on Thursdays
  const year = thisWeekThursday.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const firstThursday = new Date(startOfYear)
  const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
  firstThursday.setUTCDate(1 + daysUntilThursday)
  
  const weekNumber = Math.floor((thisWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// Helper: Get yesterday's date in KST
function getYesterdayKST(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000))
  return yesterday.toISOString().split('T')[0]
}

// Helper: Set default goals if they don't exist
async function ensureDefaultGoals(today: string, weekKey: string) {
  const yesterday = getYesterdayKST()
  
  const communityDailyKey = `community:daily:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`
  const dailySongGoalKey = `daily:goal:${today}`
  const missionsKey = `daily:missions:${today}`
  
  // Check and set daily community goal
  const dailyGoal = await kv.get(communityDailyKey)
  if (!dailyGoal) {
    await kv.set(communityDailyKey, { target: DEFAULT_COMMUNITY_DAILY, current: 0 }, { ex: 86400 })
    console.log(`✅ Set default daily community goal: ${DEFAULT_COMMUNITY_DAILY}`)
  }
  
  // Check and set weekly community goal
  const weeklyGoal = await kv.get(communityWeeklyKey)
  if (!weeklyGoal) {
    await kv.set(communityWeeklyKey, { target: DEFAULT_COMMUNITY_WEEKLY, current: 0 }, { ex: 604800 })
    console.log(`✅ Set default weekly community goal: ${DEFAULT_COMMUNITY_WEEKLY}`)
  }
  
  // Check and set daily song goal (copy from yesterday)
  const songGoal = await kv.get(dailySongGoalKey)
  if (!songGoal) {
    const yesterdaySongGoalKey = `daily:goal:${yesterday}`
    const yesterdaySongGoal = await kv.get<{ song: string; trackId?: number; target: number }>(yesterdaySongGoalKey)
    
    if (yesterdaySongGoal?.song) {
      await kv.set(dailySongGoalKey, {
        song: yesterdaySongGoal.song,
        trackId: yesterdaySongGoal.trackId,
        target: yesterdaySongGoal.target || DEFAULT_SONG_GOAL_TARGET,
        current: 0
      }, { ex: 86400 })
      console.log(`✅ Copied yesterday's song goal: "${yesterdaySongGoal.song}" (${yesterdaySongGoal.target})`)
    }
  }
  
  // Check and set missions (copy from yesterday)
  const missions = await kv.get(missionsKey)
  if (!missions || (Array.isArray(missions) && missions.length === 0)) {
    const yesterdayMissionsKey = `daily:missions:${yesterday}`
    const yesterdayMissions = await kv.get<Mission[]>(yesterdayMissionsKey)
    
    if (yesterdayMissions && yesterdayMissions.length > 0) {
      // Update mission IDs to include today's date
      const todayMissions = yesterdayMissions.map(m => ({
        ...m,
        id: `${m.trackId}-${today}`
      }))
      
      await kv.set(missionsKey, todayMissions, { ex: 86400 })
      console.log(`✅ Copied ${todayMissions.length} missions from yesterday`)
    }
  }
}

export async function GET(request: Request) {
  try {
    // --- Cron auth check ---
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    const cronRunTime = Date.now()

    console.log(`🚀 Cron started at ${new Date(cronRunTime).toISOString()}`)

    // --- Ensure default goals exist ---
    await ensureDefaultGoals(today, weekKey)

    // --- Keys ---
    const communityDailyKey = `community:daily:${today}`
    const dailySongGoalKey = `daily:goal:${today}`
    const communityWeeklyKey = `community:weekly:${weekKey}`
    const missionsKey = `daily:missions:${today}`

    // --- Load goals and missions ---
    const [communityDaily, dailySongGoal, communityWeekly, missions] = await Promise.all([
      kv.get<{ target: number; current?: number }>(communityDailyKey),
      kv.get<{ song: string; trackId?: number; target: number; current?: number }>(dailySongGoalKey),
      kv.get<{ target: number; current?: number }>(communityWeeklyKey),
      kv.get<Mission[]>(missionsKey)
    ])

    // --- Initialize NEW stream counters ---
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0
    let usersProcessed = 0
    let usersSkipped = 0

    // --- Fetch all users with stats.fm ---
    const userKeys = await kv.keys("user:*:statsfm")
    console.log(`📊 Processing ${userKeys.length} users...`)

    for (const key of userKeys) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        
        if (!statsfmUsername) {
          usersSkipped++
          continue
        }

        // ⏱️ RATE LIMITING: Removed delays to prevent timeout
        // If you get rate limited, add back: await delay(100)

        const lastProcessedKey = `user:${userId}:last_processed`
        const lastProcessed = await kv.get<number>(lastProcessedKey) || 0

        // Fetch streams
        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
        
        if (!res.ok) {
          console.log(`⚠️ Failed to fetch streams for ${statsfmUsername}: ${res.status}`)
          usersSkipped++
          continue
        }

        const data = await res.json()
        const streams = data.items || []

        // Filter ATEEZ streams newer than last processed
        const newStreams = streams.filter((s: any) => {
          const streamTime = new Date(s.endTime).getTime()
          return s.artistIds?.includes(ATEEZ_ARTIST_ID) && streamTime > lastProcessed
        })

        if (newStreams.length === 0) {
          usersSkipped++
          continue
        }

        usersProcessed++
        console.log(`✅ Processing ${newStreams.length} new streams for ${statsfmUsername}`)

        // --- Track total ATEEZ streams (all time) ---
        await kv.incrby(`user:${userId}:total_streams`, newStreams.length)

        // --- Process streams for each goal ---
        
        // Community Daily Goal (ANY ATEEZ)
        if (communityDaily) {
          const todayStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today
          })

          if (todayStreams.length > 0) {
            newDailyStreams += todayStreams.length

            const userDailyKey = `community:daily:user:${userId}:${today}`
            const currentUserDaily = await kv.get<number>(userDailyKey) || 0
            const newTotal = currentUserDaily + todayStreams.length
            await kv.set(userDailyKey, newTotal, { ex: 86400 })
            
            // Update best day if today is higher
            const currentHighest = await kv.get<number>(`user:${userId}:highest_daily_streams`) || 0
            if (newTotal > currentHighest) {
              await kv.set(`user:${userId}:highest_daily_streams`, newTotal)
            }
          }
        }

        // Daily Song Goal (SPECIFIC song by trackId)
        if (dailySongGoal?.trackId) {
          const songStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today && 
                   s.trackId === dailySongGoal.trackId
          })

          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length

            const userSongKey = `daily:streams:${userId}:${today}`
            const currentUserSong = await kv.get<number>(userSongKey) || 0
            await kv.set(userSongKey, currentUserSong + songStreams.length, { ex: 86400 })
          }
        } else if (dailySongGoal?.song) {
          // Fallback to song name if no trackId
          const songStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today && 
                   s.trackName === dailySongGoal.song
          })

          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length

            const userSongKey = `daily:streams:${userId}:${today}`
            const currentUserSong = await kv.get<number>(userSongKey) || 0
            await kv.set(userSongKey, currentUserSong + songStreams.length, { ex: 86400 })
          }
        }

        // Weekly Goal (ANY ATEEZ)
        if (communityWeekly) {
          const weekStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            
            // Calculate which week this stream belongs to (Thursday-start)
            const streamDay = kstDate.getUTCDay()
            const daysSinceThursday = (streamDay + 7 - 4) % 7
            const streamWeekThursday = new Date(kstDate)
            streamWeekThursday.setUTCDate(kstDate.getUTCDate() - daysSinceThursday)
            streamWeekThursday.setUTCHours(0, 0, 0, 0)
            
            const streamYear = streamWeekThursday.getUTCFullYear()
            const startOfYear = new Date(Date.UTC(streamYear, 0, 1))
            const firstThursday = new Date(startOfYear)
            const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
            firstThursday.setUTCDate(1 + daysUntilThursday)
            
            const streamWeekNumber = Math.floor((streamWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
            const streamWeekKey = `${streamYear}-W${String(streamWeekNumber).padStart(2, '0')}`
            
            return streamWeekKey === weekKey
          })

          if (weekStreams.length > 0) {
            newWeeklyStreams += weekStreams.length

            const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
            const currentUserWeekly = await kv.get<number>(userWeeklyKey) || 0
            await kv.set(userWeeklyKey, currentUserWeekly + weekStreams.length, { ex: 604800 })
          }
        }

        // Missions
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = newStreams.filter((s: any) => {
              const streamDate = new Date(s.endTime)
              const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
              return kstDate.toISOString().split('T')[0] === today && 
                     s.trackId === mission.trackId
            })

            if (missionStreams.length > 0) {
              const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
              const current = await kv.get<number>(progressKey) || 0
              await kv.set(progressKey, current + missionStreams.length, { ex: 86400 })
            }
          }
        }

        // Update last processed timestamp
        await kv.set(lastProcessedKey, cronRunTime, { ex: 604800 })

      } catch (error) {
        console.error(`❌ Error processing user ${key}:`, error)
        usersSkipped++
        // Continue to next user
        continue
      }
    }

    console.log(`📊 Summary: ${usersProcessed} processed, ${usersSkipped} skipped`)

    // --- RECALCULATE goal totals from ALL user contributions ---
    // This ensures accuracy even if cron was missed or users joined mid-day
    
    if (communityDaily) {
      // Get ALL user contributions for today
      const pattern = `community:daily:user:*:${today}`
      const userDailyKeys = await kv.keys(pattern)
      let totalDailyStreams = 0
      
      console.log(`🔍 Found ${userDailyKeys.length} contributor keys matching: ${pattern}`)
      
      for (const key of userDailyKeys) {
        const userStreams = await kv.get<number>(key) || 0
        totalDailyStreams += userStreams
        console.log(`  ${key}: ${userStreams} streams`)
      }
      
      await kv.set(communityDailyKey, { ...communityDaily, current: totalDailyStreams }, { ex: 86400 })
      console.log(`✅ Daily goal recalculated: ${totalDailyStreams} total streams (${userDailyKeys.length} contributors)`)
    }

    if (dailySongGoal) {
      // Get ALL user contributions for song goal today
      const userSongKeys = await kv.keys(`daily:streams:*:${today}`)
      let totalSongStreams = 0
      
      for (const key of userSongKeys) {
        const userStreams = await kv.get<number>(key) || 0
        totalSongStreams += userStreams
      }
      
      await kv.set(dailySongGoalKey, { ...dailySongGoal, current: totalSongStreams }, { ex: 86400 })
      console.log(`✅ Song goal recalculated: ${totalSongStreams} total streams (${userSongKeys.length} contributors)`)
    }

    if (communityWeekly) {
      // Get ALL user contributions for this week
      const userWeeklyKeys = await kv.keys(`community:weekly:user:*:${weekKey}`)
      let totalWeeklyStreams = 0
      
      for (const key of userWeeklyKeys) {
        const userStreams = await kv.get<number>(key) || 0
        totalWeeklyStreams += userStreams
      }
      
      await kv.set(communityWeeklyKey, { ...communityWeekly, current: totalWeeklyStreams }, { ex: 604800 })
      console.log(`✅ Weekly goal recalculated: ${totalWeeklyStreams} total streams (${userWeeklyKeys.length} contributors)`)
    }

    // --- CHECK AND UPDATE STREAKS FOR ALL USERS ---
    console.log(`🔥 Checking streaks for all users...`)
    
    const yesterday = getYesterdayKST()
    let streaksUpdated = 0
    
    // Get all users
    const allUserKeys = await kv.keys("user:*:statsfm")
    
    for (const userKey of allUserKeys) {
      try {
        const userId = userKey.split(":")[1]
        
        // Check if user completed ALL missions today
        if (missions && missions.length > 0) {
          let allMissionsComplete = true
          
          for (const mission of missions) {
            const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
            const progress = await kv.get<number>(progressKey) || 0
            
            if (progress < mission.target) {
              allMissionsComplete = false
              break
            }
          }
          
          if (allMissionsComplete) {
            // User completed all missions! Update streak
            const streakKey = `streak:${userId}`
            const lastActiveKey = `streak:${userId}:last_active`
            const longestKey = `streak:${userId}:longest`
            
            const currentStreak = await kv.get<number>(streakKey) || 0
            const lastActive = await kv.get<string>(lastActiveKey)
            const longestStreak = await kv.get<number>(longestKey) || 0
            
            // Check if already completed today
            if (lastActive === today) {
              continue // Already updated today
            }
            
            // Calculate new streak
            let newStreak = 1
            if (lastActive === yesterday) {
              // Consecutive day!
              newStreak = currentStreak + 1
            } else if (lastActive && lastActive < yesterday) {
              // Streak broken, reset to 1
              newStreak = 1
            }
            
            // Save streak
            await kv.set(streakKey, newStreak)
            await kv.set(lastActiveKey, today)
            
            // Update longest if needed
            if (newStreak > longestStreak) {
              await kv.set(longestKey, newStreak)
            }
            
            // Track total mission sets completed
            await kv.incr(`user:${userId}:total_mission_sets`)
            
            streaksUpdated++
            console.log(`  🔥 Updated streak for user ${userId}: ${newStreak} days`)
          }
        }
      } catch (error) {
        console.error(`❌ Error checking streak for ${userKey}:`, error)
        continue
      }
    }
    
    console.log(`✅ Updated ${streaksUpdated} streaks`)

    return NextResponse.json({
      success: true,
      processed: {
        users: usersProcessed,
        skipped: usersSkipped,
        daily: newDailyStreams,
        song: newDailySongStreams,
        weekly: newWeeklyStreams
      },
      date: today,
      week: weekKey
    })

  } catch (error) {
    console.error("❌ Cron error:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}