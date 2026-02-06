// Simplified hook that uses existing /api/daily-missions

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

// Helper: Get current date in KST
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

export function useMissionStreak() {
  const { user } = useUser()
  const userId = user?.id
  
  const [streakData, setStreakData] = useState<{
    currentStreak: number
    longestStreak: number
    lastActive: string | null
  } | null>(null)

  // Fetch streak data
  const fetchStreak = async () => {
    if (!userId) return
    
    try {
      const response = await fetch('/api/streak')
      if (response.ok) {
        const data = await response.json()
        setStreakData(data)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    }
  }

  // Update streak when all missions complete
  const updateStreak = async () => {
    if (!userId) return
    
    try {
      const response = await fetch('/api/streak', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        setStreakData({
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          lastActive: getKSTDate()
        })
        
        // Show celebration if new record!
        if (data.isNewRecord) {
          console.log('🎉 New streak record!')
          // You can add a toast notification here
        }
        
        return data
      }
    } catch (error) {
      console.error('Error updating streak:', error)
    }
  }

  // Check if all missions are complete (missions already have 'current' from GET /api/daily-missions)
  const checkAllMissionsComplete = (missions: any[]) => {
    if (!missions || missions.length === 0) return false
    
    // Check each mission's progress
    for (const mission of missions) {
      // If any mission is incomplete, return false
      if (mission.current < mission.target) {
        return false
      }
    }
    
    // All missions complete!
    return true
  }

  useEffect(() => {
    fetchStreak()
  }, [userId])

  return {
    streakData,
    updateStreak,
    checkAllMissionsComplete,
    refetchStreak: fetchStreak
  }
}

// Example usage in DailyMissions component:
/*
const { streakData, updateStreak, checkAllMissionsComplete } = useMissionStreak()

// When missions data loads/updates
useEffect(() => {
  if (missions && missions.length > 0) {
    const allComplete = checkAllMissionsComplete(missions)
    
    if (allComplete) {
      // Update streak
      updateStreak()
      
      // Show celebration
      console.log('All missions complete! 🔥')
    }
  }
}, [missions]) // Run when missions update
*/