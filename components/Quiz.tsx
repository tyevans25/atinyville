"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { quizQuestions, type Question } from "@/data/questions"
import { Clock, Trophy, Play, User } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function Quiz() {
  const { isSignedIn, user } = useUser()
  
  // Username state
  const [username, setUsername] = useState("")
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)

  // Quiz state management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [speedBonus, setSpeedBonus] = useState(0)

  // Results state
  const [submittingScore, setSubmittingScore] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  // Auto-check if user is signed in
  useEffect(() => {
    if (isSignedIn && user && !usernameSubmitted) {
      // Use Clerk username only
      const clerkUsername = user.username || 'ATINY'
      setUsername(clerkUsername)
      handleUsernameSubmit(null, clerkUsername)
    }
  }, [isSignedIn, user])

  // Timer logic - counts UP instead of down
  useEffect(() => {
    if (!isAnswered && usernameSubmitted) {
      const timer = setTimeout(() => setTimeElapsed(timeElapsed + 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeElapsed, isAnswered, usernameSubmitted])

  // Calculate speed bonus - decreases by 10 points every 3 seconds
  const calculateSpeedBonus = () => {
    if (timeElapsed <= 3) return 50
    if (timeElapsed <= 6) return 40
    if (timeElapsed <= 9) return 30
    if (timeElapsed <= 12) return 20
    if (timeElapsed <= 15) return 10
    return 0
  }

  // Get current bonus to show in UI
  const getCurrentBonus = () => {
    if (isAnswered) return speedBonus
    return calculateSpeedBonus()
  }

  const handleUsernameSubmit = async (e: React.FormEvent | null, presetUsername?: string) => {
    if (e) e.preventDefault()
    
    const usernameToCheck = presetUsername || username.trim()
    
    if (!usernameToCheck) {
      setUsernameError("Please enter a username")
      return
    }

    if (usernameToCheck.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return
    }

    if (usernameToCheck.length > 20) {
      setUsernameError("Username must be less than 20 characters")
      return
    }

    setCheckingUsername(true)
    setUsernameError("")

    try {
      // Check if user already played today
      const response = await fetch('/api/quiz/check-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameToCheck })
      })

      const data = await response.json()

      if (data.hasPlayed) {
        setUsernameError("You already played today! Come back tomorrow for a new attempt. 🏴‍☠️")
        setCheckingUsername(false)
        return
      }

      if (presetUsername) {
        setUsername(presetUsername)
      }
      setUsernameSubmitted(true)
    } catch (error) {
      console.error('Error checking username:', error)
      setUsernameError("Something went wrong. Please try again.")
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleSubmitAnswer = () => {
    if (isAnswered) return

    setIsAnswered(true)
    
    // Check if answer is correct
    if (selectedAnswer === currentQuestion.correctAnswer) {
      const bonus = calculateSpeedBonus()
      setSpeedBonus(bonus)
      setScore(score + currentQuestion.points + bonus)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setTimeElapsed(0)
      setSpeedBonus(0)
    } else {
      setQuizCompleted(true)
      submitScoreToLeaderboard()
    }
  }

  const submitScoreToLeaderboard = async () => {
    setSubmittingScore(true)
    
    try {
      const response = await fetch('/api/quiz/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), score })
      })

      const data = await response.json()

      if (data.success) {
        setUserRank(data.rank)
        setIsNewBest(data.isNewBest)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setSubmittingScore(false)
    }
  }

  // Sign-in prompt screen for non-authenticated users
  if (!usernameSubmitted && !isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center glass-header-blue text-white">
            <div className="mx-auto mb-4 w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
              <Trophy className="w-10 h-10 text-blue-400" />
            </div>
            <CardTitle className="text-3xl">Sign In to Play</CardTitle>
            <CardDescription className="text-gray-300">
              You need to be signed in to take the ATEEZ Streaming Quiz!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300 mb-2">
                📝 <strong>Why sign in?</strong>
              </p>
              <ul className="text-xs text-gray-300 space-y-1 ml-4">
                <li>• Track your scores on the leaderboard</li>
                <li>• One quiz attempt per day</li>
                <li>• Compete with other ATINYs!</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link href="/sign-in" className="flex-1">
                <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="flex-1">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white" size="lg">
                  Sign Up
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <Link href="/leaderboard">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  View Leaderboard
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <a href="/">
                <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                  Back to Hub
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state while checking authentication
  if (!usernameSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (quizCompleted) {
    const maxScore = quizQuestions.reduce((sum, q) => sum + q.points + 50, 0)
    const percentage = Math.round((score / maxScore) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-2xl">
          <CardHeader className="text-center glass-header-blue text-white">
            <div className="mx-auto mb-4 w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30">
              <Trophy className="w-10 h-10 text-blue-400" />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription className="text-gray-300">Great job, {username}! 🏴‍☠️</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-blue-400 mb-2">{score}</p>
              <p className="text-gray-300">Total Points</p>
              {isNewBest && (
                <p className="text-green-400 font-semibold mt-2">🎉 New Personal Best!</p>
              )}
            </div>
            
            {userRank && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-400 font-semibold mb-1">Your Rank</p>
                <p className="text-4xl font-bold text-blue-400">#{userRank}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Accuracy</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <Progress value={percentage} max={100} className="bg-white/10" />
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-white">Share your score on Twitter!</p>
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  const text = `I just scored ${score} points on the ATEEZ Streaming Quiz! 🏴‍☠️${userRank ? ` Ranked #${userRank}!` : ''} Can you beat my score, ATINY?\n\n#ATEEZ #에이티즈`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                }}
              >
                Share on Twitter
              </Button>
            </div>

            <div className="flex gap-3">
              <Link href="/leaderboard" className="flex-1">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                  View Leaderboard
                </Button>
              </Link>
              <a href="/" className="flex-1">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                  Back to Hub
                </Button>
              </a>
            </div>

            <p className="text-xs text-center text-gray-400">
              Come back tomorrow to play again and improve your rank!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header with progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-semibold">{username}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">{score} points</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{timeElapsed}s</span>
              {!isAnswered && getCurrentBonus() > 0 && (
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full ml-2 font-bold">
                  ⚡ +{getCurrentBonus()} bonus
                </span>
              )}
            </div>
          </div>
          <Progress value={progress} max={100} className="bg-white/10" />
          <p className="text-white/80 text-sm">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </p>
        </div>

        {/* Question Card */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle>{currentQuestion.question}</CardTitle>
            <CardDescription className="text-gray-300">
              Worth {currentQuestion.points} points + speed bonus (50 pts max, decreases every 3 sec)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Video Embed */}
            {currentQuestion.videoUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={currentQuestion.videoUrl}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Spotify Embed */}
            {currentQuestion.spotifyUrl && (
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src={currentQuestion.spotifyUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = isAnswered
                
                let buttonClass = ""
                if (showResult) {
                  if (isCorrect) {
                    buttonClass = "bg-green-500 text-white border-green-600 hover:bg-green-500"
                  } else if (isSelected && !isCorrect) {
                    buttonClass = "bg-red-500 text-white border-red-600 hover:bg-red-500"
                  } else {
                    buttonClass = "text-white border-white/10" // Unselected answers after reveal
                  }
                } else if (isSelected) {
                  buttonClass = "bg-blue-500 text-white border-blue-400"
                } else {
                  buttonClass = "text-white border-white/10" // Unselected answers before answering
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`h-auto py-4 text-left justify-start hover:bg-white/5 ${buttonClass}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                )
              })}
            </div>

            {/* Show explanation after answering */}
            {isAnswered && currentQuestion.explanation && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1 text-white">
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct! 🎉" : "Not quite!"}
                </p>
                <p className="text-sm text-gray-300">
                  {currentQuestion.explanation}
                </p>
                {speedBonus > 0 && (
                  <p className="text-sm font-semibold text-blue-400 mt-2">
                    Speed Bonus: +{speedBonus} points! ⚡
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  size="lg"
                >
                  {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}