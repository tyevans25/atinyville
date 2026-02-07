"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Target, TrendingUp } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface DailyGoalData {
    target?: unknown
    current?: unknown
    userStreams?: unknown
}

const safeNumber = (value: unknown, fallback = 0): number => {
    return typeof value === "number" && !Number.isNaN(value) ? value : fallback
}

// Member names and their possible variations
const members = ['hongjoong', 'seonghwa', 'yunho', 'yeosang', 'san', 'mingi', 'wooyoung', 'jongho']

// Generate all possible GIF paths
const getAllPossibleGifs = (category: string): string[] => {
    const gifs: string[] = []
    
    members.forEach(member => {
        // Try base name (e.g., hongjoong.gif)
        gifs.push(`/gifs/${category}/${member}.gif`)
        
        // Try numbered variations (e.g., hongjoong2.gif, hongjoong3.gif, etc.)
        for (let i = 2; i <= 10; i++) {
            gifs.push(`/gifs/${category}/${member}${i}.gif`)
        }
    })
    
    return gifs
}

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// Get random GIF based on progress tier
const getRandomGif = (current: number, target: number): string => {
    const progress = current / target
    
    let category: string
    if (progress >= 1) {
        category = 'celebration'
    } else if (progress >= 0.33) {
        category = 'progress'
    } else {
        category = 'motivation'
    }
    
    // Get all possible GIFs for this category and SHUFFLE them
    const possibleGifs = shuffleArray(getAllPossibleGifs(category))
    
    // Pick the first one from shuffled array (truly random)
    return possibleGifs[0]
}

// Get message based on progress
const getProgressMessage = (current: number, target: number): string => {
    const progress = current / target
    
    if (progress >= 1) return "🎉 Goal Complete!"
    if (progress >= 0.33) return "💪 You're getting there!"
    return "🏴‍☠️ Let's go ATINY!"
}

export default function DailyGoalCard() {
    const { isSignedIn, user } = useUser()
    const [goalData, setGoalData] = useState<DailyGoalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRemaining, setTimeRemaining] = useState("")
    const [currentGif, setCurrentGif] = useState<string>("")
    const [gifError, setGifError] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [hasPlayedSound, setHasPlayedSound] = useState(false)
    const { width, height } = useWindowSize()

    useEffect(() => {
        fetchGoalData()
        const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [isSignedIn])

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const nowKST = new Date(now.getTime() + (9 * 60 * 60 * 1000))
            
            const tomorrowKST = new Date(nowKST)
            tomorrowKST.setUTCDate(tomorrowKST.getUTCDate() + 1)
            tomorrowKST.setUTCHours(0, 0, 0, 0)
            
            const diff = tomorrowKST.getTime() - nowKST.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            
            setTimeRemaining(`${hours}h ${minutes}m`)
        }

        updateTimer()
        const timer = setInterval(updateTimer, 60000)
        return () => clearInterval(timer)
    }, [])

    // Update GIF when goal data changes
    useEffect(() => {
        if (goalData) {
            const target = safeNumber(goalData.target)
            const current = safeNumber(goalData.current)
            const userStreams = safeNumber(goalData.userStreams)
            
            // Pick new random GIF based on current progress
            const newGif = getRandomGif(current, target)
            setCurrentGif(newGif)
            setGifError(false) // Reset error state
            
            // Check if goal is complete and user contributed
            if (current >= target && userStreams > 0) {
                // Show confetti
                if (!showConfetti) {
                    setShowConfetti(true)
                    setTimeout(() => setShowConfetti(false), 5000) // Stop after 5 seconds
                }
                
                // Play sound (only once per session)
                if (!hasPlayedSound) {
                    const audio = new Audio('/sounds/fixon.mp3')
                    audio.play().catch(err => console.log('Audio play failed:', err))
                    setHasPlayedSound(true)
                }
            }
        }
    }, [goalData, showConfetti, hasPlayedSound])

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

    // Handle GIF load error - try a different one
    const handleGifError = () => {
        if (goalData) {
            const target = safeNumber(goalData.target)
            const current = safeNumber(goalData.current)
            
            // Try a different random GIF
            const newGif = getRandomGif(current, target)
            if (newGif !== currentGif) {
                setCurrentGif(newGif)
            } else {
                // If we get the same one, hide the GIF
                setGifError(true)
            }
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
        <>
            {/* Confetti - only shows when goal complete and user contributed */}
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.3}
                />
            )}
            
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
                    {isSignedIn && (
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
        </>
    )
}