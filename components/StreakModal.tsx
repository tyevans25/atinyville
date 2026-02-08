"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { type Badge, type UserStats } from '@/lib/badge-system'

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}

const getTierInfo = (streak: number) => {
  if (streak >= 30) return { image: '/tiers/cap_RH.svg', name: "Captain's Right Hand", description: "Standing closest to the helm as the Captain's most trusted advisor. Hold the course.", next: null, progress: 100, rank: 4 }
  if (streak >= 14) return { image: '/tiers/1st_mate.svg', name: 'First Mate', description: "You've survived treacherous paths and made the trusted circle. Maintain it.", next: "Captain's Right Hand", target: 30, progress: ((streak - 14) / 16) * 100, rank: 3 }
  if (streak >= 7) return { image: '/tiers/corsair.svg', name: 'Corsair', description: "A daring pirate of the high seas. Keep moving forward to the next adventure.", next: 'First Mate', target: 14, progress: ((streak - 7) / 7) * 100, rank: 2 }
  if (streak >= 1) return { image: '/tiers/wayfinder.svg', name: 'Wayfinder', description: "You're navigating the vast ocean and learning life at sea. Don't lose direction.", next: 'Corsair', target: 7, progress: ((streak - 1) / 6) * 100, rank: 1 }
  return { image: '/tiers/deckhand.svg', name: 'Deckhand', description: "You're just getting started. Earn your keep.", next: 'Wayfinder', target: 1, progress: 0, rank: 0 }
}

// Get week days following Thursday-Wednesday reset in KST
const getWeekDaysKST = (currentStreak: number) => {
  const now = new Date()
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  
  // Get current day of week (0 = Sunday, 4 = Thursday)
  const kstDay = kstNow.getUTCDay()
  
  // Calculate days since last Thursday
  const daysSinceThursday = (kstDay + 7 - 4) % 7
  
  // Get the date of this week's Thursday (start of week)
  const thisWeekThursday = new Date(kstNow)
  thisWeekThursday.setUTCDate(kstNow.getUTCDate() - daysSinceThursday)
  thisWeekThursday.setUTCHours(0, 0, 0, 0)
  
  const days = []
  const dayLabels = ['T', 'F', 'S', 'S', 'M', 'T', 'W'] // Thu, Fri, Sat, Sun, Mon, Tue, Wed
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(thisWeekThursday)
    date.setUTCDate(thisWeekThursday.getUTCDate() + i)
    
    // Check if this day is completed based on streak
    // A day is completed if it's within the streak count, counting backwards from today
    const daysFromToday = daysSinceThursday - i
    const completed = daysFromToday >= 0 && daysFromToday < currentStreak
    
    days.push({
      day: dayLabels[i],
      completed,
      isToday: i === daysSinceThursday
    })
  }
  
  return days
}

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setBadges(data.badges)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tier = stats ? getTierInfo(stats.currentStreak) : null
  const daysRemaining = tier?.next ? (tier.target! - (stats?.currentStreak || 0)) : 0

  const weekDays = getWeekDaysKST(stats?.currentStreak || 0)
  const completedDays = weekDays.filter(d => d.completed).length

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Ambient glow effects */}
      <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-56 h-56 bg-purple-500/15 rounded-full blur-[100px] translate-x-24 translate-y-12 pointer-events-none" />
      
      <div className="relative w-full max-w-md">
        {/* Animated gradient border */}
        <div 
          className="absolute -inset-[1px] rounded-2xl opacity-75"
          style={{
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6)',
            backgroundSize: '200% 100%',
            animation: 'gradientShift 3s linear infinite'
          }}
        />
        
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">ATINY Stats</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Main Display - Tier image with streak number */}
              <div className="flex items-center gap-5">
                {/* Tier badge image */}
                <div className="relative flex-shrink-0">
                  {/* Outer glow */}
                  <div 
                    className="absolute inset-0 blur-xl opacity-50"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                  />
                  {/* Tier image */}
                  <div className="relative w-24 h-28">
                    {tier?.image && (
                      <Image
                        src={tier.image}
                        alt={tier.name}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    )}
                  </div>
                  {/* Sparkle */}
                  <div className="absolute -top-1 -right-1 text-blue-400 text-sm animate-pulse">✦</div>
                </div>

                {/* Tier info and progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white truncate">{tier?.name}</h2>
                    <span className="flex-shrink-0 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-medium">
                      RANK {tier?.rank}
                    </span>
                  </div>
                  
                  {/* Tier description */}
                  <p className="text-xs text-gray-400 italic mb-2">{tier?.description}</p>

                  {/* Streak count */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-3xl font-black text-white">{stats?.currentStreak || 0}</span>
                    <span className="text-sm text-gray-400">day streak</span>
                  </div>
                  
                  {tier?.next ? (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Progress to {tier.next}</span>
                        <span>{Math.round(tier.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${tier.progress}%`,
                            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-green-400">🏆 Highest level reached!</p>
                  )}
                </div>
              </div>

              {/* Stats Bar - Player card style */}
              <div className="bg-black/40 rounded-xl border border-white/5 px-4 py-3">
                <div className="flex justify-between text-center">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">{stats?.totalStreams?.toLocaleString() || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Total Streams</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">{stats?.longestStreak || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Best Streak</div>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="flex-1">
                    <div className="text-xl font-bold text-white">{stats?.highestDailyStreams || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Best Day</div>
                  </div>
                </div>
              </div>

              {/* Weekly Streak - Thursday to Wednesday (KST) */}
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Weekly Streak</span>
                  <span className="text-xs text-blue-400 font-medium">{completedDays}/7 Complete</span>
                </div>
                <div className="flex gap-2">
                  {weekDays.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className={`w-full h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all relative
                          ${day.completed 
                            ? 'text-white shadow-lg' 
                            : 'bg-gray-800 text-gray-600 border border-gray-700/50'}`}
                        style={day.completed ? {
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                        } : {}}
                      >
                        {day.completed ? '✓' : day.day}
                        {/* Today indicator */}
                        {day.isToday && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-2">Week resets Thursday 12AM KST</p>
              </div>

              {/* Achievements - With hover tooltip */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    🏆 Achievements
                  </span>
                  <span className="text-xs text-gray-500">{badges.length} unlocked</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-5">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center group relative"
                    >
                      <div className="relative w-20 h-24">
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image 
                          src={badge.image} 
                          alt={badge.name}
                          fill
                          className="object-contain drop-shadow-lg transition-transform group-hover:scale-105"
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-300 mt-2 text-center max-w-[80px]">
                        {badge.name}
                      </p>
                      
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48 shadow-xl">
                        <p className="text-xs font-semibold text-white mb-1">{badge.name}</p>
                        <p className="text-[10px] text-gray-400">{badge.description}</p>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                      </div>
                    </div>
                  ))}
                  
                  {/* Locked badge placeholders */}
                  {badges.length < 6 && (
                    <>
                      {Array.from({ length: Math.min(6 - badges.length, 3) }).map((_, i) => (
                        <div
                          key={`locked-${i}`}
                          className="flex flex-col items-center opacity-30"
                        >
                          <div className="w-20 h-24 rounded-b-[40%] bg-gradient-to-b from-gray-700/50 to-gray-800/50 flex items-center justify-center">
                            <span className="text-2xl">🔒</span>
                          </div>
                          <p className="text-xs font-medium text-gray-600 mt-2">Locked</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Motivational footer */}
              <div 
                className="rounded-xl p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                <p className="text-white font-medium text-sm">
                  {stats && stats.currentStreak > 0 
                    ? `🔥 You're on fire! Don't break your ${stats.currentStreak}-day streak!`
                    : "Complete your first mission set to start your streak!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}