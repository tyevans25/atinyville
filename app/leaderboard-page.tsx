"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
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
          <p className="text-purple-100 text-center">
            Top ATINYs by Quiz Score
          </p>
        </div>

        {/* Leaderboard Card */}
        <Card className="bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Trophy className="w-6 h-6" />
              Top 20 Scores
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scores yet! Be the first to take the quiz.
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getMedalIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${entry.rank <= 3 ? 'text-purple-900' : 'text-gray-900'}`}>
                          {entry.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${entry.rank <= 3 ? 'text-purple-600' : 'text-gray-700'}`}>
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <Link href="/">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Take the Quiz
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
