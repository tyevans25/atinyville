"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Circle, Music } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Mission {
    id: string
    trackId: number
    trackName: string
    target: number
    current: number
}

export default function DailyMissions() {
    const { isSignedIn } = useUser()
    const [missions, setMissions] = useState<Mission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isSignedIn) {
            fetchMissions()
            // Refresh every 5 minutes
            const interval = setInterval(fetchMissions, 5 * 60 * 1000)
            return () => clearInterval(interval)
        } else {
            setLoading(false)
        }
    }, [isSignedIn])

    const fetchMissions = async () => {
        try {
            const response = await fetch("/api/daily-missions")
            if (response.ok) {
                const data = await response.json()
                setMissions(data.missions || [])
            }
        } catch (error) {
            console.error("Error fetching missions:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!isSignedIn) {
        return (
            <Card className="glass-card">
                <CardHeader className="glass-header-blue text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Daily Missions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-gray-400 text-center">Sign in to see your daily missions</p>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="glass-card">
                <CardHeader className="glass-header-blue text-white">
                    <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Daily Missions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-gray-400">Loading missions...</p>
                </CardContent>
            </Card>
        )
    }

    const completedCount = missions.filter(m => m.current >= m.target).length
    const totalMissions = missions.length

    return (
        <Card className="glass-card">
            <CardHeader className="glass-header-blue text-white">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        Daily Missions
                    </CardTitle>
                    <span className="text-sm font-semibold">
                        {completedCount} / {totalMissions} Complete
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {missions.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No missions set for today</p>
                ) : (
                    <div className="space-y-3">
                        {missions.map((mission) => {
                            const isComplete = mission.current >= mission.target
                            const progress = Math.min(mission.current, mission.target)

                            return (
                                <div
                                    key={mission.id}
                                    className={`bg-white/5 border rounded-lg p-4 transition-all ${
                                        isComplete 
                                            ? 'border-green-500/30 bg-green-500/5' 
                                            : 'border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Mission Text */}
                                        <div className="flex-1">
                                            <p className={`font-semibold ${
                                                isComplete ? 'text-green-400 line-through' : 'text-white'
                                            }`}>
                                                Stream "{mission.trackName}" {mission.target} {mission.target === 1 ? 'time' : 'times'}
                                            </p>
                                            {!isComplete && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {progress} / {mission.target} completed
                                                </p>
                                            )}
                                            {isComplete && (
                                                <p className="text-xs text-green-400 mt-1">
                                                    ✓ Mission complete!
                                                </p>
                                            )}
                                        </div>

                                        {/* Progress Circles */}
                                        <div className="flex gap-2">
                                            {Array.from({ length: mission.target }).map((_, index) => {
                                                const isFilled = index < progress
                                                return (
                                                    <div key={index}>
                                                        {isFilled ? (
                                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-gray-600" />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Completion Message */}
                {completedCount === totalMissions && totalMissions > 0 && (
                    <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                        <p className="text-green-400 font-semibold">
                            🎉 All missions complete! Great job!
                        </p>
                    </div>
                )}

                {/* Info */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    Missions reset daily at 12AM KST. Keep streaming to complete new missions!
                </p>
            </CardContent>
        </Card>
    )
}