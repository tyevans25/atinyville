"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { quizQuestions, type Question } from "@/data/questions"
import { Clock, Trophy, Play } from "lucide-react"

export default function Quiz() {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0) // Track elapsed time instead of countdown
  const [isAnswered, setIsAnswered] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [speedBonus, setSpeedBonus] = useState(0)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  // Timer logic - counts UP instead of down
  useEffect(() => {
    if (!isAnswered) {
      const timer = setTimeout(() => setTimeElapsed(timeElapsed + 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeElapsed, isAnswered])

  // Calculate speed bonus - decreases by 10 points every 3 seconds
  const calculateSpeedBonus = () => {
    if (timeElapsed <= 3) return 50   // 0-3 seconds = 50 points
    if (timeElapsed <= 6) return 40   // 4-6 seconds = 40 points
    if (timeElapsed <= 9) return 30   // 7-9 seconds = 30 points
    if (timeElapsed <= 12) return 20  // 10-12 seconds = 20 points
    if (timeElapsed <= 15) return 10  // 13-15 seconds = 10 points
    return 0 // After 15 seconds = no bonus
  }

  // Get current bonus to show in UI
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
      setTimeElapsed(0) // Reset timer to 0
      setSpeedBonus(0)
    } else {
      setQuizCompleted(true)
    }
  }

  // Results screen
  if (quizCompleted) {
    const maxScore = quizQuestions.reduce((sum, q) => sum + q.points + 50, 0) // Max includes all speed bonuses
    const percentage = Math.round((score / maxScore) * 100)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>Great job, ATINY! 🏴‍☠️</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-primary mb-2">{score}</p>
              <p className="text-muted-foreground">Total Points</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="font-semibold">{percentage}%</span>
              </div>
              <Progress value={percentage} max={100} />
            </div>

            <div className="bg-secondary p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Share your score on Twitter!</p>
              <Button 
                className="w-full"
                onClick={() => {
                  const text = `I just scored ${score} points on the ATEEZ Streaming Quiz! 🏴‍☠️ Can you beat my score, ATINY?\n\n#ATEEZ #에이티즈`
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
                }}
              >
                Share on Twitter
              </Button>
            </div>

            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                setCurrentQuestionIndex(0)
                setScore(0)
                setQuizCompleted(false)
                setSelectedAnswer(null)
                setIsAnswered(false)
                setTimeElapsed(0)
              }}
            >
              Take Quiz Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header with progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-white">
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
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
            <CardDescription>
              Worth {currentQuestion.points} points + speed bonus (50 pts max, decreases every 3 sec)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  }
                } else if (isSelected) {
                  buttonClass = "bg-primary text-white"
                }

                return (
                  <Button
                    key={index}
                    variant={isSelected && !showResult ? "default" : "outline"}
                    className={`h-auto py-4 text-left justify-start ${buttonClass}`}
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
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct! 🎉" : "Not quite!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.explanation}
                </p>
                {speedBonus > 0 && (
                  <p className="text-sm font-semibold text-primary mt-2">
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
                  className="flex-1"
                  size="lg"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  onClick={handleNextQuestion}
                  className="flex-1"
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
