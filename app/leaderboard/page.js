'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [scores, setScores] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('all') // all, today, week

  useEffect(() => {
    const savedScores = JSON.parse(localStorage.getItem('scores') || '[]')
    setScores(savedScores)
  }, [])

  const getFilteredScores = () => {
    if (filterPeriod === 'all') return scores

    const now = new Date()
    const filtered = scores.filter(score => {
      const scoreDate = new Date(score.date)
      if (filterPeriod === 'today') {
        return scoreDate.toDateString() === now.toDateString()
      }
      if (filterPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return scoreDate >= weekAgo
      }
      return true
    })
    return filtered
  }

  const filteredScores = getFilteredScores()

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <button className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-5xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-purple-200 text-lg">Top ATINYs by Score</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-6 justify-center">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filterPeriod === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filterPeriod === 'week'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilterPeriod('today')}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              filterPeriod === 'today'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-purple-200 hover:bg-white/20'
            }`}
          >
            Today
          </button>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
          {filteredScores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏴‍☠️</div>
              <p className="text-white text-xl font-semibold mb-2">No scores yet!</p>
              <p className="text-purple-200 mb-6">Be the first to take the quiz and claim the top spot</p>
              <Link href="/quiz">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold transition-all">
                  Start Quiz
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredScores.map((entry, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between p-4 rounded-xl transition-all
                    ${index < 3 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50' 
                      : 'bg-white/5 border border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold ${index < 3 ? 'w-12' : 'w-12 text-white/50'}`}>
                      {getMedalEmoji(index)}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-lg">{entry.username}</p>
                      <p className="text-purple-300 text-sm">
                        {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">{entry.score}</p>
                    <p className="text-purple-300 text-sm">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Card */}
        {filteredScores.length > 0 && (
          <div className="mt-6 bg-purple-500/20 backdrop-blur rounded-2xl p-6 border border-purple-400/30">
            <h3 className="text-white font-bold text-xl mb-4">Quiz Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-purple-200 text-sm mb-1">Total Players</p>
                <p className="text-white text-2xl font-bold">{filteredScores.length}</p>
              </div>
              <div className="text-center">
                <p className="text-purple-200 text-sm mb-1">Average Score</p>
                <p className="text-white text-2xl font-bold">
                  {Math.round(filteredScores.reduce((sum, s) => sum + s.score, 0) / filteredScores.length)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-purple-200 text-sm mb-1">Highest Score</p>
                <p className="text-white text-2xl font-bold">{filteredScores[0]?.score || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-6 text-center">
          <Link href="/quiz">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg">
              Take the Quiz
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
