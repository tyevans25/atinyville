'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Question from '@/components/Question'
import Timer from '@/components/Timer'
import { quizQuestions, calculateSpeedBonus } from '@/data/questions'

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(quizQuestions[0].timeLimit)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return // Already answered
    
    setIsTimerActive(false)
    setSelectedAnswer(answerIndex)
    
    // Calculate points
    let points = 0
    if (answerIndex === currentQuestion.correctAnswer) {
      points = currentQuestion.points
      const bonus = calculateSpeedBonus(timeRemaining, currentQuestion.timeLimit)
      points += bonus
    }
    
    setEarnedPoints(points)
    setScore(prevScore => prevScore + points)
    setShowResult(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      // Save score to localStorage
      const username = localStorage.getItem('username') || 'Anonymous'
      const scores = JSON.parse(localStorage.getItem('scores') || '[]')
      scores.push({
        username,
        score,
        date: new Date().toISOString(),
        questionsAnswered: quizQuestions.length
      })
      scores.sort((a, b) => b.score - a.score)
      localStorage.setItem('scores', JSON.stringify(scores.slice(0, 100))) // Keep top 100
      
      router.push(`/results?score=${score}`)
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setIsTimerActive(true)
      setTimeRemaining(quizQuestions[currentQuestionIndex + 1].timeLimit)
    }
  }

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setSelectedAnswer(-1) // Mark as unanswered
      setShowResult(true)
      setEarnedPoints(0)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">ATEEZ Quiz Challenge</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
            >
              Exit Quiz
            </button>
          </div>
          
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm text-purple-200">Question</p>
              <p className="text-xl font-bold">
                {currentQuestionIndex + 1} / {quizQuestions.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-200">Total Score</p>
              <p className="text-xl font-bold">{score}</p>
            </div>
          </div>
        </div>

        {/* Timer */}
        {!showResult && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 border border-white/20">
            <Timer 
              timeLimit={currentQuestion.timeLimit}
              onTimeUp={handleTimeUp}
              isActive={isTimerActive}
            />
          </div>
        )}

        {/* Question */}
        <div className="mb-6">
          <Question 
            question={currentQuestion}
            onAnswer={handleAnswer}
            selectedAnswer={selectedAnswer}
          />
        </div>

        {/* Result Feedback */}
        {showResult && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 border border-white/20 animate-fade-in">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-green-400 mb-2">Correct!</h3>
                <p className="text-white text-xl mb-4">
                  You earned <span className="font-bold text-yellow-400">{earnedPoints}</span> points
                </p>
                {earnedPoints > currentQuestion.points && (
                  <p className="text-purple-300 text-sm">
                    Including a speed bonus!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl mb-4">😢</div>
                <h3 className="text-3xl font-bold text-red-400 mb-2">
                  {selectedAnswer === -1 ? "Time's Up!" : "Incorrect"}
                </h3>
                <p className="text-white text-lg">
                  The correct answer was: <span className="font-bold text-green-400">
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </span>
                </p>
              </div>
            )}
            
            <button
              onClick={handleNext}
              className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg"
            >
              {isLastQuestion ? 'View Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
