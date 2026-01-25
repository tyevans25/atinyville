'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = searchParams.get('score') || 0
  const [username, setUsername] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    if (savedUsername) {
      setUsername(savedUsername)
    } else {
      setShowNameInput(true)
    }
  }, [])

  const handleSaveName = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim())
      setShowNameInput(false)
    }
  }

  const shareToTwitter = () => {
    const text = `I just scored ${score} points on the ATEEZ Streaming Quiz! 🏴‍☠️ Can you beat my score? #ATEEZ #ATINY`
    const url = window.location.origin
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const getRank = () => {
    const totalPoints = 750 // Sum of all possible points (adjust based on your questions)
    const percentage = (score / totalPoints) * 100
    
    if (percentage >= 90) return { title: 'LEGENDARY ATINY', emoji: '👑', color: 'text-yellow-400' }
    if (percentage >= 75) return { title: 'EXPERT ATINY', emoji: '⭐', color: 'text-purple-400' }
    if (percentage >= 50) return { title: 'DEDICATED ATINY', emoji: '💜', color: 'text-blue-400' }
    if (percentage >= 25) return { title: 'GROWING ATINY', emoji: '🌱', color: 'text-green-400' }
    return { title: 'BABY ATINY', emoji: '🐣', color: 'text-orange-400' }
  }

  const rank = getRank()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {showNameInput ? (
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Enter Your Name</h2>
            <p className="text-purple-200 mb-6">Your name will appear on the leaderboard</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your ATINY name"
              className="w-full px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/50 border-2 border-white/20 focus:border-purple-400 outline-none mb-4"
              maxLength={20}
            />
            <button
              onClick={handleSaveName}
              disabled={!username.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Continue to Results
            </button>
          </div>
        ) : (
          <>
            {/* Results Card */}
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6 border border-white/20 text-center">
              <div className="mb-6">
                <div className="text-8xl mb-4">{rank.emoji}</div>
                <h2 className={`text-4xl font-bold ${rank.color} mb-2`}>{rank.title}</h2>
                <p className="text-purple-200">Great job, {username}!</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600/50 to-indigo-700/50 rounded-2xl p-8 mb-6">
                <p className="text-purple-200 text-sm mb-2">YOUR FINAL SCORE</p>
                <p className="text-7xl font-bold text-white mb-2">{score}</p>
                <p className="text-purple-200">points</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-purple-200 text-sm mb-1">Questions</p>
                  <p className="text-white text-2xl font-bold">5</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-purple-200 text-sm mb-1">Accuracy</p>
                  <p className="text-white text-2xl font-bold">{Math.round((score / 750) * 100)}%</p>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={shareToTwitter}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-bold text-lg mb-4 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on Twitter
              </button>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/quiz" className="block">
                  <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold transition-all">
                    Take Quiz Again
                  </button>
                </Link>
                <Link href="/leaderboard" className="block">
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold border-2 border-white/20 hover:border-purple-400 transition-all">
                    View Leaderboard
                  </button>
                </Link>
                <Link href="/" className="block">
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all">
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>

            {/* Encouragement Message */}
            <div className="bg-purple-500/20 backdrop-blur rounded-2xl p-6 border border-purple-400/30 text-center">
              <p className="text-white text-lg mb-2">💡 Pro Tip</p>
              <p className="text-purple-200">
                Keep streaming ATEEZ on Spotify and YouTube to discover more about the songs featured in this quiz!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
