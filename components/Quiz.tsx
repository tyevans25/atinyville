"use client"

import { useState, useEffect } from "react"
import { quizQuestions, type Question } from "@/data/questions"
import { Clock, Trophy, Play, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function Quiz() {
  const { isSignedIn, user } = useUser()

  const [username, setUsername] = useState("")
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isAnswered, setIsAnswered] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [speedBonus, setSpeedBonus] = useState(0)

  const [submittingScore, setSubmittingScore] = useState(false)
  const [userRank, setUserRank] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100

  useEffect(() => {
    if (isSignedIn && user && !usernameSubmitted) {
      const clerkUsername = user.username || 'ATINY'
      setUsername(clerkUsername)
      handleUsernameSubmit(null, clerkUsername)
    }
  }, [isSignedIn, user])

  useEffect(() => {
    if (!isAnswered && usernameSubmitted) {
      const timer = setTimeout(() => setTimeElapsed(timeElapsed + 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeElapsed, isAnswered, usernameSubmitted])

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

  const handleUsernameSubmit = async (e: React.FormEvent | null, presetUsername?: string) => {
    if (e) e.preventDefault()
    const usernameToCheck = presetUsername || username.trim()
    if (!usernameToCheck) { setUsernameError("Please enter a username"); return }
    if (usernameToCheck.length < 3) { setUsernameError("Username must be at least 3 characters"); return }
    if (usernameToCheck.length > 20) { setUsernameError("Username must be less than 20 characters"); return }
    setCheckingUsername(true)
    setUsernameError("")
    try {
      const response = await fetch('/api/quiz/check-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameToCheck })
      })
      const data = await response.json()
      if (data.hasPlayed) {
        setUsernameError("You already played today! Come back tomorrow. 🏴‍☠️")
        setCheckingUsername(false)
        return
      }
      if (presetUsername) setUsername(presetUsername)
      setUsernameSubmitted(true)
    } catch (error) {
      setUsernameError("Something went wrong. Please try again.")
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswered) setSelectedAnswer(answerIndex)
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
    setSubmittingScore(true)
    try {
      const response = await fetch('/api/quiz/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), score })
      })
      const data = await response.json()
      if (data.success) { setUserRank(data.rank); setIsNewBest(data.isNewBest) }
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setSubmittingScore(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "rgba(22,32,56,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    overflow: "hidden",
  }

  const btnPrimary: React.CSSProperties = {
    background: "#e6edf3", color: "#0d1117",
    border: "none", borderRadius: 10, padding: "12px 24px",
    fontSize: 14, fontWeight: 800, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }

  const btnOutline: React.CSSProperties = {
    background: "transparent", color: "#e6edf3",
    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "12px 24px",
    fontSize: 13, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  }

  // ── Sign-in required ────────────────────────────────────────
  if (!usernameSubmitted && !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ ...cardStyle, width: "100%", maxWidth: 420 }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)" }} />
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(88,166,255,0.15)", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Trophy style={{ width: 32, height: 32, color: "#58a6ff" }} />
            </div>
            <h2 style={{ color: "#e6edf3", fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>Sign In Required</h2>
            <p style={{ color: "#8b949e", fontSize: 13, lineHeight: 1.6, margin: "0 0 24px" }}>
              Please sign in on the homepage to take the ATEEZ Streaming Quiz!
            </p>
            <div style={{ background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 10, padding: 16, marginBottom: 24, textAlign: "left" }}>
              <p style={{ color: "#58a6ff", fontSize: 12, fontWeight: 700, margin: "0 0 8px" }}>Why sign in?</p>
              <ul style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
                <li>Track your scores on the leaderboard</li>
                <li>One quiz attempt per day</li>
                <li>Compete with other ATINYs!</li>
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a href="/" style={{ textDecoration: "none" }}>
                <button style={{ ...btnPrimary, width: "100%" }}>Go to Homepage</button>
              </a>
              <Link href="/leaderboard" style={{ textDecoration: "none" }}>
                <button style={{ ...btnOutline, width: "100%" }}>View Leaderboard</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Loading ─────────────────────────────────────────────────
  if (!usernameSubmitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8b949e", fontSize: 13 }}>Loading...</p>
      </div>
    )
  }

  // ── Results ─────────────────────────────────────────────────
  if (quizCompleted) {
    const maxScore = quizQuestions.reduce((sum, q) => sum + q.points + 50, 0)
    const percentage = Math.round((score / maxScore) * 100)

    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ ...cardStyle, width: "100%", maxWidth: 520 }}>
          <div style={{ height: 2, background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)" }} />
          <div style={{ padding: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(88,166,255,0.15)", border: "1px solid rgba(88,166,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trophy style={{ width: 32, height: 32, color: "#58a6ff" }} />
              </div>
              <h2 style={{ color: "#e6edf3", fontSize: 24, fontWeight: 900, margin: "0 0 6px" }}>Quiz Complete!</h2>
              <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>Great job, {username}! 🏴‍☠️</p>
            </div>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <p style={{ color: "#58a6ff", fontSize: 64, fontWeight: 900, lineHeight: 1, margin: "0 0 4px" }}>{score}</p>
              <p style={{ color: "#484f58", fontSize: 13, margin: 0 }}>Total Points</p>
              {isNewBest && <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, marginTop: 8 }}>🎉 New Personal Best!</p>}
            </div>

            {userRank && (
              <div style={{ background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 10, padding: 16, textAlign: "center", marginBottom: 20 }}>
                <p style={{ color: "#484f58", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Your Rank</p>
                <p style={{ color: "#58a6ff", fontSize: 42, fontWeight: 900, margin: 0 }}>#{userRank}</p>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#8b949e", fontSize: 12 }}>Accuracy</span>
                <span style={{ color: "#e6edf3", fontSize: 12, fontWeight: 700 }}>{percentage}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percentage}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 3, transition: "width 0.6s ease" }} />
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ color: "#e6edf3", fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Share your score on Twitter!</p>
              <button style={{ ...btnPrimary, width: "100%" }} onClick={() => {
                const text = `I just scored ${score} points on the ATEEZ Streaming Quiz! 🏴‍☠️${userRank ? ` Ranked #${userRank}!` : ''} Can you beat my score, ATINY?\n\n#ATEEZ #에이티즈`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
              }}>
                Share on Twitter
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/leaderboard" style={{ flex: 1, textDecoration: "none" }}>
                <button style={{ ...btnOutline, width: "100%" }}>View Leaderboard</button>
              </Link>
              <a href="/" style={{ flex: 1, textDecoration: "none" }}>
                <button style={{ ...btnOutline, width: "100%" }}>Back to Hub</button>
              </a>
            </div>

            <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 16 }}>
              Come back tomorrow to play again and improve your rank!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz screen ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Progress bar + stats */}
        <div style={{ ...cardStyle, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <User style={{ width: 14, height: 14, color: "#484f58" }} />
              <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: 700 }}>{username}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy style={{ width: 14, height: 14, color: "#FFD700" }} />
              <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: 700 }}>{score} pts</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Clock style={{ width: 14, height: 14, color: "#484f58" }} />
              <span style={{ color: "#e6edf3", fontSize: 13, fontWeight: 700 }}>{timeElapsed}s</span>
              {!isAnswered && getCurrentBonus() > 0 && (
                <span style={{ fontSize: 11, background: "rgba(234,179,8,0.2)", color: "#FFD700", border: "1px solid rgba(234,179,8,0.3)", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                  ⚡ +{getCurrentBonus()}
                </span>
              )}
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
          <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
        </div>

        {/* Question card */}
        <div style={cardStyle}>
          <div style={{ height: 2, background: "linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)" }} />
          <div style={{ padding: "20px 22px" }}>
            <h3 style={{ color: "#e6edf3", fontSize: 17, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.4 }}>{currentQuestion.question}</h3>
            <p style={{ color: "#484f58", fontSize: 11, margin: "0 0 18px" }}>
              Worth {currentQuestion.points} pts + speed bonus (50 max, decreases every 3s)
            </p>

            {currentQuestion.videoUrl && (
              <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", aspectRatio: "16/9", marginBottom: 18 }}>
                <iframe width="100%" height="100%" src={currentQuestion.videoUrl} title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen style={{ display: "block", border: "none" }} />
              </div>
            )}

            {currentQuestion.spotifyUrl && (
              <div style={{ borderRadius: 10, overflow: "hidden", marginBottom: 18 }}>
                <iframe src={currentQuestion.spotifyUrl} width="100%" height="152" frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
              </div>
            )}

            {/* Answer options */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10, marginBottom: 16 }}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = isAnswered
                let bg = "rgba(255,255,255,0.04)"
                let border = "1px solid rgba(255,255,255,0.08)"
                let color = "#e6edf3"
                if (showResult) {
                  if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "1px solid rgba(34,197,94,0.4)"; color = "#4ade80" }
                  else if (isSelected) { bg = "rgba(239,68,68,0.15)"; border = "1px solid rgba(239,68,68,0.4)"; color = "#f87171" }
                } else if (isSelected) {
                  bg = "rgba(88,166,255,0.15)"; border = "1px solid rgba(88,166,255,0.4)"; color = "#58a6ff"
                }
                return (
                  <button key={index} onClick={() => handleAnswerSelect(index)} disabled={isAnswered}
                    style={{ background: bg, border, borderRadius: 10, padding: "14px 16px", color, fontSize: 13, fontWeight: 600, cursor: isAnswered ? "default" : "pointer", textAlign: "left", transition: "all 0.15s" }}>
                    <span style={{ fontWeight: 900, marginRight: 8, opacity: 0.6 }}>{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <div style={{ background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <p style={{ color: "#e6edf3", fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct! 🎉" : "Not quite!"}
                </p>
                <p style={{ color: "#8b949e", fontSize: 12, lineHeight: 1.6, margin: 0 }}>{currentQuestion.explanation}</p>
                {speedBonus > 0 && (
                  <p style={{ color: "#FFD700", fontSize: 12, fontWeight: 700, margin: "8px 0 0" }}>⚡ Speed Bonus: +{speedBonus} points!</p>
                )}
              </div>
            )}

            {/* Action button */}
            {!isAnswered ? (
              <button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}
                style={{ ...btnPrimary, width: "100%", opacity: selectedAnswer === null ? 0.4 : 1 }}>
                Submit Answer
              </button>
            ) : (
              <button onClick={handleNextQuestion} style={{ ...btnPrimary, width: "100%" }}>
                {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question →" : "See Results"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}