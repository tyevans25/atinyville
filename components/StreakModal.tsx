"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { type Badge, type UserStats } from '@/lib/badge-system'

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}

// Get badge tier based on streak
const getTierInfo = (streak: number) => {
  if (streak >= 30) return { emoji: '🏴‍☠️', name: 'Captain ATINY', next: null, progress: 100 }
  if (streak >= 14) return { emoji: '⭐', name: 'Star ATINY', next: 'Captain ATINY', target: 30, progress: ((streak - 14) / 16) * 100 }
  if (streak >= 7) return { emoji: '🔥', name: 'Fire ATINY', next: 'Star ATINY', target: 14, progress: ((streak - 7) / 7) * 100 }
  if (streak >= 1) return { emoji: '🌱', name: 'Sprout ATINY', next: 'Fire ATINY', target: 7, progress: ((streak - 1) / 6) * 100 }
  return { emoji: '❓', name: 'No Tier', next: 'Sprout ATINY', target: 1, progress: 0 }
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

  // Get current week (last 7 days)
  const getWeekDays = () => {
    const days = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' })[0],
        completed: i <= (stats?.currentStreak || 0) - 1 && (stats?.currentStreak || 0) > 0
      })
    }
    
    return days
  }

  const weekDays = getWeekDays()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/20 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Progress</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Tier Progress Section */}
            <div className="flex items-center gap-6">
              {/* Progress Ring */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (tier?.progress || 0) / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl">{tier?.emoji}</span>
                  <span className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</span>
                </div>
              </div>

              {/* Tier Info */}
              <div className="flex-1">
                <p className="text-sm text-gray-400">Current Tier</p>
                <p className="text-xl font-bold text-white mb-2">{tier?.name}</p>
                
                {tier?.next ? (
                  <>
                    <p className="text-sm text-gray-400">Next Tier</p>
                    <p className="text-lg font-semibold text-blue-400">{tier.next}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-green-400">🏆 Highest level reached!</p>
                )}
              </div>
            </div>

            {/* Week View */}
            <div>
              <p className="text-sm text-gray-400 mb-3">This Week</p>
              <div className="flex justify-between gap-2">
                {weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{day.day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      day.completed 
                        ? 'bg-green-500/20 border-2 border-green-500' 
                        : 'bg-white/5 border-2 border-white/10'
                    }`}>
                      {day.completed && <span className="text-sm">✅</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats?.currentStreak || 0}</p>
                <p className="text-xs text-gray-400">🔥 Current Streak</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats?.longestStreak || 0}</p>
                <p className="text-xs text-gray-400">🏆 Longest Streak</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats?.totalStreams.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-400">🎵 Total Streams</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats?.highestDailyStreams || 0}</p>
                <p className="text-xs text-gray-400">✨ Best Day</p>
              </div>
            </div>

            {/* Badges Section */}
            <div>
              <p className="text-sm text-gray-400 mb-3">🏆 Achievements ({badges.length} unlocked)</p>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-3 text-center"
                  >
                    <img 
                      src={badge.image} 
                      alt={badge.name}
                      className="w-12 h-12 mx-auto mb-1"
                    />
                    <p className="text-xs font-semibold text-white">{badge.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
                  </div>
                ))}
                
                {/* Show some locked badges */}
                {badges.length < 18 && (
                  <>
                    {Array.from({ length: Math.min(6 - badges.length, 3) }).map((_, i) => (
                      <div
                        key={`locked-${i}`}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 text-center opacity-50"
                      >
                        <span className="text-3xl block mb-1 filter grayscale">🔒</span>
                        <p className="text-xs font-semibold text-gray-500">Locked</p>
                        <p className="text-xs text-gray-600 mt-0.5">Keep going!</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              {badges.length > 6 && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  ...and {badges.length - 6} more!
                </p>
              )}
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-lg p-4 text-center">
              <p className="text-white font-semibold">
                {stats && stats.currentStreak > 0 
                  ? `🔥 You're on fire! Don't break your ${stats.currentStreak}-day streak!`
                  : "🌱 Complete your first mission set to start your streak!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}