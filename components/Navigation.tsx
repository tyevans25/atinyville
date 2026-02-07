"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Trophy, TrendingUp, ShoppingBag, Map, Play } from "lucide-react"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import StreakModal from "@/components/StreakModal"

// Get badge tier based on streak
const getBadgeTier = (streak: number) => {
  if (streak >= 30) return { emoji: '🏴‍☠️', label: 'Captain ATINY' }
  if (streak >= 14) return { emoji: '⭐', label: 'Star ATINY' }
  if (streak >= 7) return { emoji: '🔥', label: 'Fire ATINY' }
  if (streak >= 1) return { emoji: '🌱', label: 'Sprout ATINY' }
  return null
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const [streakData, setStreakData] = useState<{ currentStreak: number } | null>(null)

  // Fetch streak data when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchStreak()
    }
  }, [isSignedIn])

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/user-stats')
      if (response.ok) {
        const data = await response.json()
        setStreakData({ currentStreak: data.stats.currentStreak })
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
    }
  }

  const navItems = [
    { name: "Streaming Hub", href: "/streaming", icon: TrendingUp },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Lore", href: "/lore", icon: Map },
    { name: "Variety", href: "/variety", icon: Play },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ]

  const badge = streakData ? getBadgeTier(streakData.currentStreak) : null

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white glow-text">
                ATINYTOWN
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {/* Auth Section */}
              <div className="ml-4 pl-4 border-l border-white/10">
                {isSignedIn ? (
                  <div className="flex items-center gap-3">
                    {/* Username with Badge and Streak - CLICKABLE */}
                    {badge && streakData && streakData.currentStreak > 0 && (
                      <button
                        onClick={() => setModalOpen(true)}
                        className="flex flex-col items-end leading-tight hover:opacity-80 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-1 text-sm">
                          <span>{badge.emoji}</span>
                          <span className="text-gray-300 font-medium">{badge.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <span className="ml-3.5">🔥</span>
                          <span className="text-white font-semibold">{streakData.currentStreak}</span>
                        </div>
                      </button>
                    )}
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="px-6 py-0.5 bg-white hover:bg-gray-200 text-gray-800 rounded-lg text-sm transition-all whitespace-nowrap">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="text-lg">{item.name}</span>
                    </Link>
                  )
                })}
                
                {/* Mobile Auth */}
                <div className="pt-4 border-t border-white/10">
                  {isSignedIn ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col">
                          <span className="text-gray-300">
                            {user.firstName || user.username || 'ATINY'}
                          </span>
                          {badge && (
                            <button
                              onClick={() => {
                                setModalOpen(true)
                                setMobileMenuOpen(false)
                              }}
                              className="text-xs text-gray-400 text-left hover:text-white transition"
                            >
                              {badge.emoji} {badge.label}
                            </button>
                          )}
                        </div>
                      </div>
                      {streakData && streakData.currentStreak > 0 && (
                        <button
                          onClick={() => {
                            setModalOpen(true)
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-1 text-sm hover:opacity-80 transition"
                        >
                          <span>🔥</span>
                          <span className="text-white font-semibold">{streakData.currentStreak}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="w-full px-4 py-2 bg-white hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-all">
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Streak Modal */}
      <StreakModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}