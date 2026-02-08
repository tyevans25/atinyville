"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Target, TrendingUp } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface WeeklyGoalData {
    target?: unknown
    current?: unknown
    userStreams?: unknown
}

const safeNumber = (value: unknown, fallback = 0): number => {
    return typeof value === "number" && !Number.isNaN(value) ? value : fallback
}

// Define GIFs for weekly goal
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

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get random GIF based on progress
const getRandomGif = (current: number, target: number): string => {
    const progress = current / target
    
    const gifsToChooseFrom = progress >= 0.5 ? celebrationGifs : motivationGifs
    const shuffled = shuffleArray(gifsToChooseFrom)
    return shuffled[0]
}

// Get message based on progress
const getProgressMessage = (current: number, target: number): string => {
    const progress = current / target
    
    if (progress >= 1) return "🎉 Week Complete!"
    if (progress >= 0.5) return "💪 Halfway there!"
    return "🏴‍☠️ Let's go ATINY!"
}

export default function WeeklyGoalCard() {
    const { isSignedIn } = useUser()
    const [goalData, setGoalData] = useState<WeeklyGoalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [daysRemaining, setDaysRemaining] = useState(0)
    const [currentGif, setCurrentGif] = useState<string>("")
    const [gifError, setGifError] = useState(false)

    useEffect(() => {
        fetchGoalData()
        calculateDaysRemaining()
        
        const interval = setInterval(fetchGoalData, 10 * 60 * 1000) // 10 minutes
        const dayInterval = setInterval(calculateDaysRemaining, 60 * 1000) // 1 minute
        
        return () => {
            clearInterval(interval)
            clearInterval(dayInterval)
        }
    }, [isSignedIn])

    // Update GIF when goal data changes
    useEffect(() => {
        if (goalData) {
            const target = safeNumber(goalData.target)
            const current = safeNumber(goalData.current)
            
            const newGif = getRandomGif(current, target)
            setCurrentGif(newGif)
            setGifError(false)
        }
    }, [goalData])

    const calculateDaysRemaining = () => {
        // Get current time in KST (UTC+9)
        const now = new Date()
        const nowKST = new Date(now.getTime() + (9 * 60 * 60 * 1000))
        const dayOfWeek = nowKST.getUTCDay() // 0 = Sunday, 1 = Monday, ..., 4 = Thursday
        
        // Calculate days until next Thursday (week resets Thursday at midnight KST)
        const daysUntilThursday = (4 - dayOfWeek + 7) % 7
        
        setDaysRemaining(daysUntilThursday === 0 ? 7 : daysUntilThursday)
    }

    const fetchGoalData = async () => {
        try {
            const response = await fetch("/api/community-weekly-goal")
            if (!response.ok) {
                setGoalData(null)
                setLoading(false)
                return
            }
            const data = await response.json()
            setGoalData(data === null ? null : data)
        } catch (error) {
            console.error("Error fetching weekly goal:", error)
            setGoalData(null)
        } finally {
            setLoading(false)
        }
    }

    // Handle GIF load error
    const handleGifError = () => {
        if (goalData) {
            const target = safeNumber(goalData.target)
            const current = safeNumber(goalData.current)
            
            const newGif = getRandomGif(current, target)
            if (newGif !== currentGif) {
                setCurrentGif(newGif)
            } else {
                setGifError(true)
            }
        }
    }

    if (loading) {
        return (
            <Card className="glass-card h-full">
                <CardHeader className="glass-header-blue text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Weekly Goal
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-gray-400">Loading...</p>
                </CardContent>
            </Card>
        )
    }

    if (!goalData) {
        return (
            <Card className="glass-card h-full">
                <CardHeader className="glass-header-blue text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Weekly Goal
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-white/50 mx-auto mb-3" />
                        <p className="text-gray-300">No weekly goal set</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const target = safeNumber(goalData.target)
    const current = safeNumber(goalData.current)
    const userStreams = safeNumber(goalData.userStreams)

    const progress = target > 0 ? (current / target) * 100 : 0
    const remaining = Math.max(target - current, 0)

    return (
        <Card className="glass-card h-full">
            <CardHeader className="glass-header-blue text-white">
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Weekly Community Goal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {/* Days Remaining Badge */}
                <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 inline-flex items-center gap-2 border border-white/20">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                    </span>
                </div>

                {/* Goal Description */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">This Week's Goal</p>
                    <h4 className="text-xl font-bold text-white">Stream ANY ATEEZ songs</h4>
                    <p className="text-xs text-gray-500 mt-1">Resets Thursday 12AM KST</p>
                </div>

                {/* Progress Numbers */}
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">
                        {current.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-400">
                        / {target.toLocaleString()}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={progress} className="h-3 bg-white/10" />
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                            {remaining > 0 ? `${remaining.toLocaleString()} to go` : '🎉 Complete!'}
                        </span>
                        <span className="text-green-400">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Dynamic GIF based on progress */}
                {currentGif && !gifError && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                        <img 
                            src={currentGif} 
                            alt="Progress reaction"
                            className="w-32 h-32 mx-auto rounded-lg object-cover mb-2"
                            onError={handleGifError}
                        />
                        <p className="text-white font-semibold">
                            {getProgressMessage(current, target)}
                        </p>
                    </div>
                )}

                {/* User Contribution */}
                {isSignedIn && userStreams > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400">Your contribution</p>
                            <p className="text-lg font-bold text-white">{userStreams} streams</p>
                        </div>
                        <div className="text-right">
                            <TrendingUp className="w-4 h-4 text-green-400 inline mb-1" />
                            <p className="text-sm font-bold text-green-400">
                                {current > 0 ? ((userStreams / current) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}