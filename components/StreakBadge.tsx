import React from 'react'
import Image from 'next/image'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

// Get badge tier based on streak
const getBadgeTier = (streak: number) => {
  if (streak >= 30) {
    return {
      image: '/tiers/cap_RH.svg',
      label: "Captain's Right Hand",
      color: 'from-purple-500 to-pink-500'
    }
  }
  if (streak >= 14) {
    return {
      image: '/tiers/1st_mate.svg',
      label: 'First Mate',
      color: 'from-yellow-400 to-orange-400'
    }
  }
  if (streak >= 7) {
    return {
      image: '/tiers/corsair.svg',
      label: 'Corsair',
      color: 'from-red-500 to-orange-500'
    }
  }
  if (streak >= 1) {
    return {
      image: '/tiers/wayfinder.svg',
      label: 'Wayfinder',
      color: 'from-green-400 to-emerald-400'
    }
  }
  return {
    image: '/tiers/deckhand.svg',
    label: 'Deckhand',
    color: 'from-gray-400 to-gray-500'
  }
}

export default function StreakBadge({ streak, size = 'md', showLabel = false }: StreakBadgeProps) {
  const badge = getBadgeTier(streak)
  
  if (!badge || streak === 0) return null

  const sizeConfig = {
    sm: { container: 'text-xs px-2 py-0.5', imgSize: 16 },
    md: { container: 'text-sm px-3 py-1', imgSize: 20 },
    lg: { container: 'text-base px-4 py-2', imgSize: 24 }
  }

  const config = sizeConfig[size]

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${badge.color} text-white font-semibold ${config.container}`}
      title={badge.label}
    >
      <Image 
        src={badge.image} 
        alt={badge.label}
        width={config.imgSize}
        height={config.imgSize}
        className="object-contain"
      />
      {showLabel && <span>{badge.label}</span>}
    </div>
  )
}
