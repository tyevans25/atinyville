"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { quizQuestions, type Question } from "@/data/questions"
import { Clock, Trophy, User } from "lucide-react"
import { useUser, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

export default function Quiz() {
  const { isSignedIn, user, isLoaded } = useUser()
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [speedBonus, setSpeedBonus] = useState(0)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [checkingPlayStatus, setCheckingPlayStatus] = useState(true)

  // Results state
  const [userRank, setUserRank] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  // Check if user already played today
  useEffect(() => {
    if (isSignedIn && user) {
      checkPlayStatus()
    }
  }, [isSignedIn, user])

  const checkPlayStatus = async () => {
    try {
      const response = await fetch('/api/quiz/check-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      const data = await response.json()
      setHasPlayedToday(data.hasPlayed)
    } catch (error) {
      console.error('Error checking play status:', error)
    } finally {
      setCheckingPlayStatus(false)
    }
  }

  // Timer logic
  useEffect(() => {
    if (!isAnswered && isSignedIn && !hasPlayedToday) {
      const timer = setTimeout(() => setTimeElapsed(timeElapsed + 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeElapsed, isAnswered, isSignedIn, hasPlayedToday])

  // Calculate speed bonus
  const calculateSpeedBonus = () => {
    if (timeElapsed <= 3) return 50
    if (timeElapsed <= 6) return 40
    if (timeElapsed <= 9) return 30
    if (timeElapsed <= 12) return 20
    if (timeElapsed <= 15) return 10
    return 0
  }

  const getCurrentBonus = () => {
    if (isAnswered) return speedBonus
    return calculateSpeedBonus()
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswered) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleSubmitAnswer = () => {
    if (isAnswered) return
    setIsAnswered(true)
    
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
    try {
      const response = await fetch('/api/quiz/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          username: user?.username || user?.firstName || 'ATINY',
          score 
        })
      })

      const data = await response.json()
      if (data.success) {
        setUserRank(data.rank)
        setIsNewBest(data.isNewBest)
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  // Loading state
  if (!isLoaded || checkingPlayStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="glass-header-blue text-white text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Sign In Required</CardTitle>
            <CardDescription className="text-gray-300">
              Create a free account to take the quiz and compete on the leaderboard!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <SignInButton mode="modal">
              <Button className="w-full bg-white hover:bg-gray-200 text-gray-800" size="lg">
                Sign In / Sign Up
              </Button>
            </SignInButton>
            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                Back to Hub
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Already played today
  if (hasPlayedToday) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="glass-header-blue text-white text-center">
            <CardTitle className="text-3xl">Come Back Tomorrow!</CardTitle>
            <CardDescription className="text-gray-300">
              You've already played today, {user.firstName || user.username || 'ATINY'} 🏴‍☠️
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-300 text-center">
              You can play once per day. Check back tomorrow to improve your score!
            </p>
            <div className="flex gap-3">
              <Link href="/leaderboard" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Back to Hub
                </Button>
              </Link>
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-2xl">
          <CardHeader className="glass-header-blue text-white text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription className="text-gray-300">
              Great job, {user.firstName || user.username || 'ATINY'}! 🏴‍☠️
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="text-center py-4">
              <p className="text-7xl font-bold text-white mb-4">{score}</p>
              <p className="text-gray-400 text-lg">Total Points</p>
              {isNewBest && (
                <p className="text-green-400 font-semibold mt-4">🎉 New Personal Best!</p>
              )}
            </div>
            
            {userRank && (
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-6 text-center">
                <p className="text-sm text-blue-300 font-semibold mb-1">Your Rank</p>
                <p className="text-4xl font-bold text-white">#{userRank}</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Accuracy</span>
                <span className="font-semibold text-white">{percentage}%</span>
              </div>
              <Progress value={percentage} max={100} className="bg-white/10" />
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-white">Share your score on Twitter!</p>
              <Button 
                className="w-full bg-white hover:bg-gray-200 text-gray-800"
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
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  View Leaderboard
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  Back to Hub
                </Button>
              </Link>
            </div>

            <p className="text-xs text-center text-gray-500">
              Come back tomorrow to play again and improve your rank!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header with progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-semibold">{user.firstName || user.username || 'ATINY'}</span>
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
          <Progress value={progress} max={100} className="bg-white/20" />
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
          <CardContent className="space-y-6">
            {/* Video/Spotify Embeds */}
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
                  }
                } else if (isSelected) {
                  buttonClass = "bg-white text-gray-800 hover:bg-gray-200"
                }

                return (
                  <Button
                    key={index}
                    variant={isSelected && !showResult ? "default" : "outline"}
                    className={`h-auto py-4 text-left justify-start border-white/20 text-white hover:bg-white/10 ${buttonClass}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                )
              })}
            </div>

            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1 text-white">
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct! 🎉" : "Not quite!"}
                </p>
                <p className="text-sm text-gray-300">
                  {currentQuestion.explanation}
                </p>
                {speedBonus > 0 && (
                  <p className="text-sm font-semibold text-yellow-400 mt-2">
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
                  className="flex-1 bg-white hover:bg-gray-200 text-gray-800"
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1 bg-white hover:bg-gray-200 text-gray-800"
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
