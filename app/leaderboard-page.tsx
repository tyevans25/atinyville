"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
}

export default function LeaderboardPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingPlayStatus, setCheckingPlayStatus] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  // Check if user has played today when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      checkIfPlayedToday()
    }
  }, [isSignedIn, user])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/quiz/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfPlayedToday = async () => {
    if (!user?.username) return
    
    setCheckingPlayStatus(true)
    try {
      const response = await fetch('/api/quiz/check-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      })
      const data = await response.json()
      setHasPlayedToday(data.hasPlayed)
    } catch (error) {
      console.error('Error checking play status:', error)
    } finally {
      setCheckingPlayStatus(false)
    }
  }

  const handleQuizButtonClick = () => {
    if (!isSignedIn) {
      // Not signed in -> go to sign in page
      router.push('/sign-in')
    } else if (hasPlayedToday) {
      // Already played -> stay on leaderboard (button will show "Come back tomorrow")
      return
    } else {
      // Signed in and hasn't played -> go to quiz
      router.push('/quiz')
    }
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">#{rank}</span>
    }
  }

  const getQuizButtonText = () => {
    if (!isSignedIn) return "Take the Quiz"
    if (checkingPlayStatus) return "Checking..."
    if (hasPlayedToday) return "Come Back Tomorrow 🏴‍☠️"
    return "Take the Quiz"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-blue-200 text-center">
            Top ATINYs by Quiz Score
          </p>
        </div>

        {/* Leaderboard Card */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Trophy className="w-6 h-6" />
              Top 20 Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No scores yet! Be the first to take the quiz.
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      entry.rank <= 3
                        ? 'bg-blue-500/10 border-2 border-blue-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getMedalIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${entry.rank <= 3 ? 'text-blue-300' : 'text-white'}`}>
                          {entry.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${entry.rank <= 3 ? 'text-blue-400' : 'text-gray-300'}`}>
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <Button 
                className={`w-full ${
                  hasPlayedToday 
                    ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                onClick={handleQuizButtonClick}
                disabled={hasPlayedToday || checkingPlayStatus}
              >
                {getQuizButtonText()}
              </Button>
              
              {hasPlayedToday && (
                <p className="text-xs text-gray-400 mt-2">
                  You've already played today! Check back tomorrow for a new attempt.
                </p>
              )}
              
              {!isSignedIn && (
                <p className="text-xs text-gray-400 mt-2">
                  <Link href="/sign-in" className="text-blue-400 hover:underline">Sign in</Link> to play the quiz and compete on the leaderboard!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}