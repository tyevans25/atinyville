"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Target, ExternalLink, Music, Clock, Users } from "lucide-react"
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
    const [timeRemaining, setTimeRemaining] = useState("")

    useEffect(() => {
        fetchGoalData()
        const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isSignedIn])

    // Timer countdown to midnight
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setHours(24, 0, 0, 0)
            
            const diff = tomorrow.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            
            setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }

        updateTimer()
        const timer = setInterval(updateTimer, 1000)
        return () => clearInterval(timer)
    }, [])

    const fetchGoalData = async () => {
        try {
            const response = await fetch("/api/daily-goal")

            if (!response.ok) {
                console.error("API returned error:", response.status)
                setGoalData(null)
                setLoading(false)
                return
            }

            const data = await response.json()

            if (data === null) {
                setGoalData(null)
            } else {
                setGoalData(data)
            }
        } catch (error) {
            console.error("Error fetching goal:", error)
            setGoalData(null)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-white">Loading today's goal...</p>
            </div>
        )
    }

    if (!goalData) {
        return (
            <div className="text-center py-8">
                <Target className="w-12 h-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                    No Active Goal
                </h3>
                <p className="text-gray-300">
                    Check back soon for the next streaming goal!
                </p>
            </div>
        )
    }

    // 🧮 SANITIZED VALUES
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
            {/* Header with icon and title */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">Daily Streaming Goal</h3>
                    <p className="text-sm text-gray-400">Stream together, reach the goal 🏴‍☠️</p>
                </div>
            </div>

            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 mb-6 inline-flex items-center gap-2 border border-white/20">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-2xl font-bold text-white font-mono">{timeRemaining}</span>
            </div>

            {/* Song Name */}
            <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Today's Song</p>
                <h4 className="text-3xl font-bold text-white glow-text">"{song}"</h4>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-6 text-lg">
                Complete the daily mission together with other ATINYs! When we reach {target.toLocaleString()} streams, 
                everyone who contributed can celebrate. Teamwork makes the dream work! 💜
            </p>

            {/* Main Progress Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-6">
                <div className="mb-4">
                    <p className="text-lg font-semibold text-white mb-2">Total streams completed</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                            {current.toLocaleString()}
                        </span>
                        <span className="text-2xl text-gray-400">
                            / {target.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 flex items-center justify-end pr-3"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            {progress > 10 && (
                                <span className="text-sm font-bold text-white">
                                    {Math.round(progress)}%
                                </span>
                            )}
                        </div>
                    </div>
                    {progress <= 10 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            {Math.round(progress)}%
                        </span>
                    )}
                </div>

                <div className="mt-3 text-right">
                    <span className="text-sm text-gray-300">
                        {remaining > 0 ? `${remaining.toLocaleString()} streams to go!` : '🎉 Goal reached!'}
                    </span>
                </div>
            </div>

            {/* Personal Contribution */}
            {isSignedIn && userStreams > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Your contribution today</p>
                                <p className="text-2xl font-bold text-white">{userStreams} streams</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Your share</p>
                            <p className="text-lg font-bold text-blue-400">
                                {target > 0 ? ((userStreams / target) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {!isSignedIn ? (
                    <Link href="/streaming" className="flex-1">
                        <Button className="w-full bg-white hover:bg-gray-200 text-gray-800 h-12">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Set Up Tracking
                        </Button>
                    </Link>
                ) : userStreams === 0 ? (
                    <Link href="/streaming" className="flex-1">
                        <Button className="w-full bg-white hover:bg-gray-200 text-gray-800 h-12">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Start Contributing
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Button
                            className="flex-1 bg-white hover:bg-gray-200 text-gray-800 h-12"
                            onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(song)}`, '_blank')}
                        >
                            <Music className="w-4 h-4 mr-2" />
                            Spotify
                        </Button>
                        <Button
                            className="flex-1 bg-white hover:bg-gray-200 text-gray-800 h-12"
                            onClick={() => window.open(`https://music.apple.com/us/search?term=${encodeURIComponent(song)}`, '_blank')}
                        >
                            <Music className="w-4 h-4 mr-2" />
                            Apple Music
                        </Button>
                    </>
                )}
            </div>

            {/* Footer message */}
            <p className="text-center text-sm text-gray-400 mt-6">
                ⏰ Goal resets at midnight in your timezone
            </p>
        </div>
    )
}
