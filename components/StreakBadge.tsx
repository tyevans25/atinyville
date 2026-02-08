import React from 'react'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

// Get badge tier based on streak
const getBadgeTier = (streak: number) => {
  if (streak >= 30) {
    return {
      image: 'cap_RH.svg',
      label: "Captain's Right Hand",
      color: 'from-purple-500 to-pink-500'
    }
  }
  if (streak >= 14) {
    return {
      image: '1st_mate.svg',
      label: 'First Mate',
      color: 'from-yellow-400 to-orange-400'
    }
  }
  if (streak >= 7) {
    return {
      image: 'corsair.svg',
      label: 'Corsair',
      color: 'from-red-500 to-orange-500'
    }
  }
  if (streak >= 1) {
    return {
      image: 'wayfinder.svg',
      label: 'Wayfinder',
      color: 'from-green-400 to-emerald-400'
    }
  }
  return {
    image: 'deckhand.svg',
    label: 'Deckhand',
    color: 'from-gray-400 to-gray-500'
  }
}

export default function StreakBadge({ streak, size = 'md', showLabel = false }: StreakBadgeProps) {
  const badge = getBadgeTier(streak)
  
  if (!badge || streak === 0) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${badge.color} text-white font-semibold ${sizeClasses[size]}`}
      title={badge.label}
    >
      <span>{badge.image}</span>
      {showLabel && <span>{badge.label}</span>}
    </div>
  )
}

// Usage examples:
/*
// Small badge (navbar)
<StreakBadge streak={8} size="sm" />

// Medium badge with label (leaderboard)
<StreakBadge streak={15} size="md" showLabel />

// Large badge (profile modal)
<StreakBadge streak={32} size="lg" showLabel />
*/