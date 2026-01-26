"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, ExternalLink, TrendingUp } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

interface DailyGoalData {
  song?: unknown
  target?: unknown
  current?: unknown
  userStreams?: unknown
}

// 🔒 Runtime-safe number sanitizer
const safeNumber = (value: unknown, fallback = 0): number => {
  return typeof value === "number" && !Number.isNaN(value)
    ? value
    : fallback
}

export default function DailyGoalSlide() {
  const { isSignedIn } = useUser()
  const [goalData, setGoalData] = useState<DailyGoalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoalData()
    const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isSignedIn])

  const fetchGoalData = async () => {
    try {
      const response = await fetch("/api/daily-goal")
      const data = await response.json()

      // Accept ANY shape, sanitize later
      setGoalData(data ?? {})
    } catch (error) {
      console.error("Error fetching goal:", error)
      setGoalData({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center">
          <p className="text-white">Loading today's goal...</p>
        </div>
      </div>
    )
  }

  if (!goalData) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center">
          <Target className="w-12 h-12 text-white/50 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            No Active Goal
          </h3>
          <p className="text-gray-300">
            Check back soon for the next streaming goal!
          </p>
        </div>
      </div>
    )
  }

  // 🧮 SANITIZED VALUES (USED EVERYWHERE)
  const target = safeNumber(goalData.target)
  const current = safeNumber(goalData.current)
  const userStreams = safeNumber(goalData.userStreams)
  const song =
    typeof goalData.song === "string" && goalData.song.trim().length > 0
      ? goalData.song
      : "Unknown Song"

  const progress = target > 0 ? (current / target) * 100 : 0
  const remaining = Math.max(target - current, 0)

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">
              TODAY'S GOAL
            </span>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-white">
            Stream "{song}"
          </h3>

          <p className="text-gray-300 mb-4">
            Let's hit {target.toLocaleString()} community streams today!
          </p>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Community Progress</span>
              <span className="text-white font-semibold">
                {current.toLocaleString()} / {target.toLocaleString()}
              </span>
            </div>

            <Progress value={progress} className="h-3 bg-white/10" />

            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                {remaining > 0
                  ? `${remaining.toLocaleString()} to go!`
                  : "🎉 Goal reached!"}
              </span>
              <span className="text-green-400">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* User Contribution */}
          {isSignedIn && (
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300 font-semibold">
                  Your contribution: {userStreams} streams ✨
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isSignedIn ? (
              <Link href="/streaming">
                <Button className="bg-white hover:bg-gray-200 text-gray-800">
                  Add stats.fm to Track Yours
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : userStreams === 0 ? (
              <Link href="/streaming">
                <Button className="bg-white hover:bg-gray-200 text-gray-800">
                  Set Up Tracking
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button
                className="bg-white hover:bg-gray-200 text-gray-800"
                onClick={() =>
                  window.open(
                    "https://open.spotify.com/search/" +
                      encodeURIComponent(song),
                    "_blank"
                  )
                }
              >
                Stream on Spotify
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}

            <Link href="/streaming">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
