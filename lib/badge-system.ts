// Badge system configuration

export interface Badge {
  id: string
  name: string
  image: string
  description: string
  category: 'streak' | 'streams' | 'daily' | 'milestone'
  condition: (stats: UserStats) => boolean
}

export interface UserStats {
  currentStreak: number
  longestStreak: number
  totalStreams: number
  totalMissionSets: number
  communityGoalContributions: number
  highestDailyStreams: number
}

export const BADGES: Badge[] = [
  // STREAK BADGES
    {
    id: 'streak_1',
    name: 'Day 1 Sprout',
    image: '/badges/streak_1.svg',
    description: '1-day streak',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 1 || stats.longestStreak >= 1
  },
  {
    id: 'streak_7',
    name: 'Budding Flower',
    image: '/badges/streak_7.svg',
    description: '7-day streak',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 7 || stats.longestStreak >= 7
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    image: '/badges/streak_14.svg',
    description: '14-day streak',
    category: 'streak',
    condition: (stats) => stats.currentStreak >= 14 || stats.longestStreak >= 14
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    image: '/badges/streak_30.svg',
    description: '30-day streak',
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 30
  },
  {
    id: 'streak_50',
    name: 'Bronze Dedication',
    image: '/badges/streak_50.svg',
    description: '50-day streak',
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 50
  },
  {
    id: 'streak_100',
    name: 'Silver Commitment',
    image: '/badges/streak_100.svg',
    description: '100-day streak',
    category: 'streak',
    condition: (stats) => stats.longestStreak >= 100
  },

  // TOTAL STREAMS BADGES
  {
    id: 'streams_100',
    name: 'Getting Started',
    image: '/badges/streams_100.svg',
    description: '100 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 100
  },
  {
    id: 'streams_500',
    name: 'Warmed Up',
    image: '/badges/streams_500.svg',
    description: '500 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 500
  },
  {
    id: 'streams_1000',
    name: 'Serious Business',
    image: '/badges/streams_1000.svg',
    description: '1,000 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 1000
  },
  {
    id: 'streams_2500',
    name: 'Deckhand',
    image: '/badges/streams_2500.svg',
    description: '2,500 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 2500
  },
  {
    id: 'streams_5000',
    name: "On Captain's Crew",
    image: '/badges/streams_5000.svg',
    description: '5,000 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 5000
  },
  {
    id: 'streams_10000',
    name: "Captain's Right Hand",
    image: '/badges/streams_10000.svg',
    description: '10,000 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 10000
  },
    {
    id: 'streams_20000',
    name: "Captain's Parrot",
    image: '/badges/streams_20000.svg',
    description: '20,000 total streams',
    category: 'streams',
    condition: (stats) => stats.totalStreams >= 20000
  },

//   // DAILY ACHIEVEMENT BADGES
//   {
//     id: 'daily_50',
//     name: 'Daily Grinder',
//     emoji: '✨',
//     description: '50 streams in one day',
//     category: 'daily',
//     condition: (stats) => stats.highestDailyStreams >= 50
//   },
//   {
//     id: 'daily_100',
//     name: 'Stream Machine',
//     emoji: '💫',
//     description: '100 streams in one day',
//     category: 'daily',
//     condition: (stats) => stats.highestDailyStreams >= 100
//   },
//   {
//     id: 'daily_200',
//     name: 'Absolute Legend',
//     emoji: '🌟',
//     description: '200 streams in one day',
//     category: 'daily',
//     condition: (stats) => stats.highestDailyStreams >= 200
//   },

  // MILESTONE BADGES
  {
    id: 'first_mission',
    name: 'Successful Hit',
    image: '/badges/first_mission.svg',
    description: 'Completed first mission set',
    category: 'milestone',
    condition: (stats) => stats.totalMissionSets >= 1
  },
  {
    id: 'missions_10',
    name: 'Accomplished Hitman',
    image: '/badges/missions_10.svg',
    description: 'Completed 10 mission sets',
    category: 'milestone',
    condition: (stats) => stats.totalMissionSets >= 10
  }
//   {
//     id: 'community_10',
//     name: 'Team Player',
//     emoji: '🎊',
//     description: 'Contributed to 10 community goals',
//     category: 'milestone',
//     condition: (stats) => stats.communityGoalContributions >= 10
//   }
]

// Get all unlocked badges for a user
export function getUnlockedBadges(stats: UserStats): Badge[] {
  return BADGES.filter(badge => badge.condition(stats))
}

// Get progress to next badge in a category
export function getNextBadge(stats: UserStats, category: Badge['category']): Badge | null {
  const categoryBadges = BADGES.filter(b => b.category === category)
  const unlockedIds = getUnlockedBadges(stats).map(b => b.id)
  
  return categoryBadges.find(badge => !unlockedIds.includes(badge.id)) || null
}