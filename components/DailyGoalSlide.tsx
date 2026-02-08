"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Target, ExternalLink, Music, Clock, Users } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"

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

// Motivation GIFs (when progress < 0.9)
const motivationGifs = [
  '/gifs/motivation/hongjoong.GIF',
  '/gifs/motivation/hongjoong2.GIF',
  '/gifs/motivation/jongho.GIF',
  '/gifs/motivation/mingi.GIF',
  '/gifs/motivation/san.GIF',
  '/gifs/motivation/seonghwa.GIF',
  '/gifs/motivation/wooyoung.GIF',
  '/gifs/motivation/yeosang.gif',
  '/gifs/motivation/yunho.GIF',
  '/gifs/motivation/yunho2.GIF'
]

// Celebration GIFs (when progress >= 0.9)
const celebrationGifs = [
  '/gifs/complete/hongjoong.GIF',
  '/gifs/complete/jongho.gif',
  '/gifs/complete/mingi.GIF',
  '/gifs/complete/minig-san.GIF',
  '/gifs/complete/san.GIF',
  '/gifs/complete/seonghwa.GIF',
  '/gifs/complete/wooyoung.GIF',
  '/gifs/complete/yeosang.GIF',
  '/gifs/complete/yunho.GIF',
  '/gifs/complete/yunho2.GIF'
]

// Shuffle array for true randomness
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get random gif from array
const getRandomGif = (gifs: string[]) => {
    const shuffled = shuffleArray(gifs)
    return shuffled[0]
}

export default function DailyGoalSlide() {
    const { isSignedIn } = useUser()
    const [goalData, setGoalData] = useState<DailyGoalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState("")
    const [currentGif, setCurrentGif] = useState<string>("")

    useEffect(() => {
        fetchGoalData()
        const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isSignedIn])

    // Timer countdown to midnight KST
    useEffect(() => {
        const updateTimer = () => {
            // Get current time in KST (UTC+9)
            const now = new Date()
            const nowKST = new Date(now.getTime() + (9 * 60 * 60 * 1000))
            
            // Get midnight KST tomorrow
            const tomorrowKST = new Date(nowKST)
            tomorrowKST.setUTCDate(tomorrowKST.getUTCDate() + 1)
            tomorrowKST.setUTCHours(0, 0, 0, 0)
            
            const diff = tomorrowKST.getTime() - nowKST.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)
            
            setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }

        updateTimer()
        const timer = setInterval(updateTimer, 1000)
        return () => clearInterval(timer)
    }, [])

    // Update GIF when goal data changes
    useEffect(() => {
        if (goalData) {
            const target = safeNumber(goalData.target)
            const current = safeNumber(goalData.current)
            const progress = target > 0 ? current / target : 0
            
            // Progress >= 0.9 → celebration, < 0.9 → motivation
            if (progress >= 0.9) {
                setCurrentGif(getRandomGif(celebrationGifs))
            } else {
                setCurrentGif(getRandomGif(motivationGifs))
            }
        }
    }, [goalData])

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
    const isNearComplete = progress >= 90

    return (
        <div className="p-4 md:p-6">
            {/* Header with icon and title */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Daily Streaming Goal</h3>
                    <p className="text-xs text-gray-400">Stream together, reach the goal 🏴‍☠️</p>
                </div>
            </div>

            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 mb-4 inline-flex items-center gap-2 border border-white/20">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-lg font-bold text-white font-mono">{timeRemaining}</span>
            </div>

            {/* Song Name */}
            <div className="mb-4">
                <p className="text-gray-400 text-xs mb-1">Today's Song</p>
                <h4 className="text-2xl font-bold text-white glow-text">"{song}"</h4>
            </div>

            {/* GIF Section */}
            {currentGif && (
                <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                    <div className="relative w-full h-32 sm:h-40">
                        <Image
                            src={currentGif}
                            alt={isNearComplete ? "Celebration!" : "Keep going!"}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        {/* Overlay with message */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-2">
                            <span className="text-white text-sm font-semibold">
                                {isNearComplete ? "🎉 Almost there!" : "💪 Keep streaming!"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Description */}
            <p className="text-gray-300 mb-4 text-sm">
                Complete the daily mission together with other ATINYs! When we reach {target.toLocaleString()} streams, 
                everyone who contributed can celebrate. Teamwork makes the dream work! 🤍
            </p>

            {/* Main Progress Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-4">
                <div className="mb-3">
                    <p className="text-sm font-semibold text-white mb-1">Total streams completed</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">
                            {current.toLocaleString()}
                        </span>
                        <span className="text-xl text-gray-400">
                            / {target.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur">
                        <div 
                            className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                                isNearComplete 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-400' 
                                    : 'bg-gradient-to-r from-blue-500 to-blue-400'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            {progress > 10 && (
                                <span className="text-xs font-bold text-white">
                                    {Math.round(progress)}%
                                </span>
                            )}
                        </div>
                    </div>
                    {progress <= 10 && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                            {Math.round(progress)}%
                        </span>
                    )}
                </div>

                <div className="mt-2 text-right">
                    <span className="text-xs text-gray-300">
                        {remaining > 0 ? `${remaining.toLocaleString()} streams to go!` : '🎉 Goal reached!'}
                    </span>
                </div>
            </div>

            {/* Personal Contribution */}
            {isSignedIn && userStreams > 0 && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Your contribution today</p>
                                <p className="text-xl font-bold text-white">{userStreams} streams</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Your share</p>
                            <p className="text-base font-bold text-blue-400">
                                {current > 0 ? ((userStreams / current) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                {!isSignedIn ? (
                    <Link href="/streaming" className="flex-1">
                        <Button className="w-full bg-white hover:bg-gray-200 text-gray-800 h-10 text-sm">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Set Up Tracking
                        </Button>
                    </Link>
                ) : userStreams === 0 ? (
                    <Link href="/streaming" className="flex-1">
                        <Button className="w-full bg-white hover:bg-gray-200 text-gray-800 h-10 text-sm">
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Start Contributing
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Button
                            className="flex-1 bg-white hover:bg-gray-200 text-gray-800 h-10 text-sm"
                            onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(song)}`, '_blank')}
                        >
                            <Music className="w-3 h-3 mr-2" />
                            Spotify
                        </Button>
                        <Button
                            className="flex-1 bg-white hover:bg-gray-200 text-gray-800 h-10 text-sm"
                            onClick={() => window.open(`https://music.apple.com/us/search?term=${encodeURIComponent(song)}`, '_blank')}
                        >
                            <Music className="w-3 h-3 mr-2" />
                            Apple Music
                        </Button>
                    </>
                )}
            </div>

            {/* Footer message */}
            <p className="text-center text-xs text-gray-400 mt-3">
                ⏰ Goal resets at 12AM KST daily
            </p>
        </div>
    )
}