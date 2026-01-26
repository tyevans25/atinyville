"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Target, TrendingUp } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface DailyGoalData {
    target?: unknown
    current?: unknown
    userStreams?: unknown
}

const safeNumber = (value: unknown, fallback = 0): number => {
    return typeof value === "number" && !Number.isNaN(value) ? value : fallback
}

export default function DailyGoalCard() {
    const { isSignedIn } = useUser()
    const [goalData, setGoalData] = useState<DailyGoalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState("")

    useEffect(() => {
        fetchGoalData()
        const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isSignedIn])

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setHours(24, 0, 0, 0)
            
            const diff = tomorrow.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            
            setTimeRemaining(`${hours}h ${minutes}m`)
        }

        updateTimer()
        const timer = setInterval(updateTimer, 60000)
        return () => clearInterval(timer)
    }, [])

    const fetchGoalData = async () => {
        try {
            const response = await fetch("/api/community-daily-goal")
            if (!response.ok) {
                setGoalData(null)
                setLoading(false)
                return
            }
            const data = await response.json()
            setGoalData(data === null ? null : data)
        } catch (error) {
            console.error("Error fetching daily goal:", error)
            setGoalData(null)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="glass-card h-full">
                <CardHeader className="glass-header-blue text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Daily Goal
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
                        <Clock className="w-5 h-5" />
                        Daily Goal
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-white/50 mx-auto mb-3" />
                        <p className="text-gray-300">No daily goal set</p>
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
                    <Clock className="w-5 h-5" />
                    Daily Community Goal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {/* Timer Badge */}
                <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2 inline-flex items-center gap-2 border border-white/20">
                    <Clock className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">{timeRemaining}</span>
                </div>

                {/* Goal Description */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">Today's Goal</p>
                    <h4 className="text-xl font-bold text-white">Stream ANY ATEEZ songs</h4>
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
                                {target > 0 ? ((userStreams / target) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}