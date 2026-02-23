"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────
type TileState = "empty" | "filled" | "correct" | "present" | "absent"
type KeyState = "correct" | "present" | "absent" | "unused"

interface TileData {
  letter: string
  state: TileState
  animating: boolean
}

interface WordEntry {
  word: string
  hint: string
  def: string
}

// ── Word bank ─────────────────────────────────────────────────
const WORDS: WordEntry[] = [
  { word: "MINGI", hint: "A baby chick", def: "ATEEZ member · Main Rapper" },
  { word: "YUNHO", hint: "A puppy", def: "ATEEZ member · Main Dancer" },
  { word: "FEVER", hint: "No more, No more, No more, No more, yeah", def: "ATEEZ album · ZERO: FEVER Part.1 (2020)" },
  { word: "GHOST", hint: "Now you see that I'm a...", def: "ATEEZ song · GOLDEN HOUR Part.4" },
  { word: "APPLE", hint: "breakable", def: "Jongho breaking apples with his bare hands" },
  { word: "DANCE", hint: "ATEEZ is always doing this", def: "ATEEZ does this on stage" },
  { word: "ATINY", hint: "The best fandom ever!", def: "ATEEZ official fandom name" },
  { word: "SPACE", hint: "Shoot for the stars like NASA", def: "ATEEZ song · NASA" },
  { word: "CRAZY", hint: "Wooyoung's twerk", def: "ATEEZ song · CRAZY FORM (2023)" },
  { word: "BLACK", hint: "The Seasons Song", def: "ATEEZ song · The Black Cat Nero" },
  { word: "AEGYO", hint: "Wooyoung ranks 1st in this", def: "WOOYOUNG's aegyo" },
  { word: "LIBRA", hint: "member zodiac", def: "Jongho's zodiac sign" },
  { word: "STAGE", hint: "ATEEZ love it here", def: "ATEEZ perform here" },
  { word: "SLEEK", hint: "Seonghwa defines his style as this", def: "Seonghwa's style" },
  { word: "SWORD", hint: "WONDERLAND", def: "ATEEZ concept · Wonderland Sword" },
  { word: "JOONG", hint: "Nickname", def: "ATEEZ member: Hongjoong nickname" },
  { word: "SLIDE", hint: "Moving smooth across the floor", def: "YUNHO Solo · Slide to Me" },
  { word: "WORLD", hint: "Album Series", def: "ATEEZ album series" },
  { word: "CREEP", hint: "Meet you 4:05", def: "SAN Solo · CREEP" },
  { word: "LEMON", hint: "We can take it slow, slow, slow", def: "ATEEZ song · Lemon Drop" },
  { word: "LIGHT", hint: "Tour", def: "TOWARDS THE LIGHT:WILL TO POWER" },
  { word: "TOPAZ", hint: "a subunit", def: "WOOYOUNG & HONGJOONG - TOPAZ" },
  { word: "TOWER", hint: "Tour", def: "TOWARDS THE LIGHT:WILL TO POWER" },
  { word: "TEETH", hint: "Fiji my necklace", def: "ATEEZ song: Ice on my Teeth" },
  { word: "HOUSE", hint: "It ain't a home", def: "ATEEZ song : now this house aint a home" },
  { word: "SCENE", hint: "great minds think alike", def: "ATEEZ song: Scene 1: Value" },
  { word: "ROYAL", hint: "We run this world baby!", def: "ATEEZ song: Royal" },
  { word: "JJONG", hint: "member nickname", def: "JONGHO nickname" },
  { word: "BLIND", hint: "One of their best bsides", def: "ATEEZ song · Blind" },
  { word: "EENIE", hint: "Member feature", def: "HONGJOONG feature: EENIE MEENIE" },
  { word: "YOUTH", hint: "Best friends forever", def: "YUNGI song : YOUTH" },
  { word: "WALTZ", hint: "A Hongjoong masterpiece", def: "ATEEZ song : SELFISH WALTZ" },
  { word: "ROCKY", hint: "ATEEZ if they were profighters", def: "ATEEZ song : ROCKY" },
  { word: "SIREN", hint: "bside that's never leaving the basement", def: "ATEEZ song · SIREN" },
  { word: "LOVER", hint: "Group collab - a banger", def: "ATEEZ song : BE MY LOVER" },
  { word: "THANK", hint: "Dedicated to Seonghwa", def: "ATEEZ song: THANK U" },
  { word: "WINGS", hint: "Led to really cute moments between members on stage", def: "ATEEZ song: Dancing Like Butterfly Wings" },
  { word: "MAKES", hint: "8 to 1 team", def: "ATEEZ slogan" },
  { word: "ATEEZ", hint: "The best group ever!", def: "ATEEZ" },
  { word: "YUNGI", hint: "a subunit", def: "YUNHO & MINGI" },
  { word: "FIRST", hint: "Hongjoong was this for KQ", def: "1st Trainee" },
  { word: "APRIL", hint: "A star was born then", def: "SEONGHWA birth month" },
  { word: "FAITH", hint: "A tattoo", def: "Hongjoong's faith tattoo" },
  { word: "WIVES", hint: "Shinestars", def: "Seonghwa fans name officially" },
  { word: "MARCH", hint: "a puppy was born then", def: "YUNHO birth month" },
  { word: "SIXTH", hint: "Yeosang was this for KQ", def: "6th trainee" },
  { word: "ILSAN", hint: "2 members are from here", def: "WOOYOUNG's hometown" },
  { word: "THIRD", hint: "Mingi was this for KQ", def: "3rd Trainee" },
  { word: "BYEOL", hint: "A cat", def: "San's cat Byeol" },
  { word: "PUPPY", hint: "When 2 members are together, it is a gathering of __", def: "EKANGMO are called puppies" },
  { word: "KARMA", hint: "Something that will come around", def: "ATEEZ KARMA" },
  { word: "PETIT", hint: "Fashion", def: "Hongjoong fashion line" },
  { word: "HYUNG", hint: "On a list Seonghwa ranks 1st", def: "ATEEZ eldest" },
  { word: "DRONE", hint: "A hobby Yeosang had", def: "Drones" },
  { word: "PRADA", hint: "member attended event for them", def: "Milan FW2026 - WOOYOUNG" },
  { word: "FIFTH", hint: "Seonghwa was this for KQ", def: "5th Trainee" },
  { word: "JINJU", hint: "Seonghwa hometown", def: "Jinju" },
  { word: "TZONE", hint: "So good he got asked if it was real", def: "WOOYOUNG'S TZONE" },
  { word: "RADIO", hint: "Hohong hosted this", def: "Idol Radio" },
  { word: "GREEN", hint: "Hongjoong will not eat anything this color", def: "Vegetables" },
  { word: "WOOYO", hint: "a nickname", def: "WOOYOUNG nickname" },
  { word: "LEGOS", hint: "Seonghwa would sell you for these", def: "Seonghwa's favorite hobby" },
  { word: "ARIES", hint: "puppy sign", def: "YUNHO's zodiac sign" },
  { word: "YUJIN", hint: "Finally now.. its my time", def: "YUNHO's character in Imitation" },
  { word: "ALONE", hint: "Something Wooyoung is not and will never be", def: "WOOYOUNG's tattoo - I'm never alone and will never be" },
].filter((w, i, arr) => w.word.length === 5 && arr.findIndex(x => x.word === w.word) === i)

// Filtered word list — use this everywhere, not WORDS directly
const WORD_LIST = WORDS

const WORD_LENGTH = 5
const MAX_GUESSES = 6
const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
]

function getKSTDate(): string {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

function getTodayIndex(): number {
  const start = new Date("2025-01-01T00:00:00+09:00").getTime()
  const kstMidnight = new Date(getKSTDate() + "T00:00:00+09:00").getTime()
  return Math.floor((kstMidnight - start) / 86400000) % WORD_LIST.length
}

function getTodayKey(): string {
  return getKSTDate()
}

function evaluate(guess: string, target: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill("absent")
  const targetArr = target.split("")
  const used = Array(WORD_LENGTH).fill(false)
  guess.split("").forEach((l, i) => {
    if (l === targetArr[i]) { result[i] = "correct"; used[i] = true }
  })
  guess.split("").forEach((l, i) => {
    if (result[i] === "correct") return
    const ti = targetArr.findIndex((t, j) => t === l && !used[j])
    if (ti !== -1) { result[i] = "present"; used[ti] = true }
  })
  return result
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    fontFamily: "'DM Sans', sans-serif",
    color: "#f0f0f0",
  },
  gridBg: {
    position: "fixed" as const,
    inset: 0,
    backgroundImage: "linear-gradient(rgba(249,115,22,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.03) 1px,transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none" as const,
  },
  glow: {
    position: "fixed" as const,
    top: -200, left: "50%",
    transform: "translateX(-50%)",
    width: 600, height: 400,
    background: "radial-gradient(ellipse,rgba(249,115,22,0.08) 0%,transparent 70%)",
    pointerEvents: "none" as const,
  },
  header: {
    width: "100%", maxWidth: 500,
    padding: "20px 20px 0",
    position: "relative" as const, zIndex: 1,
  },
  headerInner: {
    borderBottom: "1px solid #2a2a2a",
    paddingBottom: 16,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  logoTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32, letterSpacing: "0.08em",
    color: "white", lineHeight: 1,
    textShadow: "0 0 8px rgba(249,115,22,0.9),0 0 20px rgba(249,115,22,0.5),0 0 40px rgba(249,115,22,0.25)",
    WebkitTextStroke: "0.5px rgba(249,115,22,0.8)",
  },
  statsStrip: {
    display: "flex", gap: 16,
    padding: "12px 0 0",
    fontSize: 11, color: "#555", letterSpacing: "0.05em",
  },
  iconBtn: {
    width: 36, height: 36,
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", fontSize: 16, color: "#555",
    transition: "all 0.15s",
  },
  hintStrip: {
    width: "100%",
    background: "#141414",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12, color: "#555",
    display: "flex", alignItems: "center", gap: 8,
  },
  hintTag: {
    background: "#7c3a0e",
    color: "#f97316",
    fontSize: 10, fontWeight: 700 as const,
    padding: "2px 8px", borderRadius: 20,
    letterSpacing: "0.05em", flexShrink: 0,
    border: "1px solid #7c3a0e",
  },
}

// ── Component ─────────────────────────────────────────────────
export default function ATINYWordle() {
  const { isSignedIn, user, isLoaded } = useUser()

  const todayData = WORD_LIST[getTodayIndex()]
  const TARGET = todayData.word.toUpperCase()

  const [grid, setGrid] = useState<TileData[][]>(() =>
    Array(MAX_GUESSES).fill(null).map(() =>
      Array(WORD_LENGTH).fill(null).map(() => ({ letter: "", state: "empty" as TileState, animating: false }))
    )
  )
  const [currentRow, setCurrentRow] = useState(0)
  const [currentCol, setCurrentCol] = useState(0)
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({})
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [toast, setToast] = useState("")
  const [shakeRow, setShakeRow] = useState<number | null>(null)
  const [bounceRow, setBounceRow] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [stats, setStats] = useState({ played: 0, won: 0, streak: 0, best: 0, dist: {} as Record<string, number> })
  const [alreadyPlayed, setAlreadyPlayed] = useState(false)
  const [isReturning, setIsReturning] = useState(false) // true if grid was restored from a previous session
  const [isRevealing, setIsRevealing] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Sync localStorage check on first render so UI is correct immediately
  useEffect(() => {
    const todayKey = getTodayKey()
    const played = localStorage.getItem("atinywordle-played")
    if (played === todayKey) {
      setAlreadyPlayed(true)
      setIsReturning(true)
      setGameOver(true)
      try {
        const saved = JSON.parse(localStorage.getItem("atinywordle-session") || "null")
        if (saved && saved.date === todayKey && saved.grid) {
          setGrid(saved.grid)
          if (saved.won) setWon(true)
          const ks: Record<string, KeyState> = {}
          for (const row of saved.grid) {
            for (const tile of row) {
              if (tile.letter && tile.state !== "empty" && tile.state !== "filled") {
                if (ks[tile.letter] !== "correct") ks[tile.letter] = tile.state as KeyState
              }
            }
          }
          setKeyStates(ks)
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    loadStats()
    checkAlreadyPlayed()
  }, [isLoaded, isSignedIn])

  async function loadStats() {
    if (isSignedIn && user) {
      try {
        const res = await fetch(`/api/wordle/stats?userId=${user.id}`)
        if (res.ok) { const data = await res.json(); setStats(data) }
      } catch {}
    } else {
      try {
        const s = JSON.parse(localStorage.getItem("atinywordle-stats") || "{}")
        setStats({ played: s.played||0, won: s.won||0, streak: s.streak||0, best: s.best||0, dist: s.dist||{} })
      } catch {}
    }
  }

  async function checkAlreadyPlayed() {
    const todayKey = getTodayKey()
    if (isSignedIn && user) {
      try {
        const res = await fetch(`/api/wordle/played?userId=${user.id}&date=${todayKey}`)
        if (res.ok) {
          const data = await res.json()
          if (data.played) {
            setAlreadyPlayed(true)
            setIsReturning(true)
            setGameOver(true)
            if (data.grid) {
              setGrid(data.grid)
              setCurrentRow(data.grid.filter((r: TileData[]) => r.some(t => t.state !== "empty" && t.state !== "filled")).length)
              // Rebuild keyboard colors from saved grid
              const ks: Record<string, KeyState> = {}
              for (const row of data.grid) {
                for (const tile of row) {
                  if (tile.letter && tile.state !== "empty" && tile.state !== "filled") {
                    if (ks[tile.letter] !== "correct") ks[tile.letter] = tile.state as KeyState
                  }
                }
              }
              setKeyStates(ks)
            }
            if (data.won) setWon(true)
          }
        }
      } catch {}
    } else {
      const played = localStorage.getItem("atinywordle-played")
      if (played === todayKey) {
        setAlreadyPlayed(true)
        setIsReturning(true)
        setGameOver(true)
        try {
          const saved = JSON.parse(localStorage.getItem("atinywordle-session") || "null")
          if (saved && saved.date === todayKey) {
            setGrid(saved.grid)
            setCurrentRow(saved.grid.filter((r: TileData[]) => r.some((t: TileData) => t.state !== "empty" && t.state !== "filled")).length)
            if (saved.won) setWon(true)
            // Rebuild keyboard colors
            const ks: Record<string, KeyState> = {}
            for (const row of saved.grid) {
              for (const tile of row) {
                if (tile.letter && tile.state !== "empty" && tile.state !== "filled") {
                  if (ks[tile.letter] !== "correct") ks[tile.letter] = tile.state as KeyState
                }
              }
            }
            setKeyStates(ks)
          }
        } catch {}
      }
    }
  }

  async function saveResult(didWin: boolean, guessCount: number, finalGrid: TileData[][]) {
    const todayKey = getTodayKey()
    if (isSignedIn && user) {
      try {
        await fetch("/api/wordle/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, win: didWin, guesses: guessCount, date: todayKey, grid: finalGrid, won: didWin })
        })
        loadStats()
      } catch {}
    } else {
      const s = { ...stats }
      s.played++
      if (didWin) { s.won++; s.streak++; s.best = Math.max(s.best, s.streak); s.dist[guessCount] = (s.dist[guessCount]||0)+1 }
      else s.streak = 0
      localStorage.setItem("atinywordle-stats", JSON.stringify(s))
      localStorage.setItem("atinywordle-played", todayKey)
      // Save grid snapshot so we can restore it on next visit
      localStorage.setItem("atinywordle-session", JSON.stringify({ date: todayKey, grid: finalGrid, won: didWin }))
      setStats(s)
      setAlreadyPlayed(true)
    }
  }

  function showToast(msg: string, duration = 1800) {
    setToast(msg)
    setTimeout(() => setToast(""), duration)
  }

  const handleKey = useCallback((key: string) => {
    if (gameOver || isRevealing || alreadyPlayed || isValidating) return
    if (key === "⌫" || key === "Backspace") deleteLetter()
    else if (key === "ENTER" || key === "Enter") submitGuess()
    else if (/^[A-Za-z]$/.test(key)) addLetter(key.toUpperCase())
  }, [gameOver, isRevealing, alreadyPlayed, isValidating, currentRow, currentCol, grid])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key)
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [handleKey])

  function addLetter(letter: string) {
    if (currentCol >= WORD_LENGTH) return
    setGrid(g => {
      const n = g.map(r => r.map(t => ({...t})))
      n[currentRow][currentCol] = { letter, state: "filled", animating: true }
      return n
    })
    setCurrentCol(c => c + 1)
    setTimeout(() => setGrid(g => {
      const n = g.map(r => r.map(t => ({...t})))
      if (n[currentRow]) n[currentRow][currentCol] = { ...n[currentRow][currentCol], animating: false }
      return n
    }), 100)
  }

  function deleteLetter() {
    if (currentCol <= 0) return
    const col = currentCol - 1
    setGrid(g => {
      const n = g.map(r => r.map(t => ({...t})))
      n[currentRow][col] = { letter: "", state: "empty", animating: false }
      return n
    })
    setCurrentCol(col)
  }

  async function submitGuess() {
    if (currentCol < WORD_LENGTH) {
      setShakeRow(currentRow)
      setTimeout(() => setShakeRow(null), 400)
      showToast("Not enough letters")
      return
    }

    const guess = grid[currentRow].map(t => t.letter).join("")

    // ATEEZ-specific words bypass dictionary (they won't be in standard dictionaries)
    const ATEEZ_WORDS = new Set(WORD_LIST.map(w => w.word))
    if (!ATEEZ_WORDS.has(guess)) {
      setIsValidating(true)
      try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess.toLowerCase()}`)
        if (!res.ok) {
          setShakeRow(currentRow)
          setTimeout(() => setShakeRow(null), 400)
          showToast("Not a valid word")
          setIsValidating(false)
          return
        }
      } catch {
        // If API unreachable, allow the guess rather than blocking the player
      }
      setIsValidating(false)
    }

    const result = evaluate(guess, TARGET)
    setIsRevealing(true)

    result.forEach((state, col) => {
      setTimeout(() => {
        setGrid(g => {
          const n = g.map(r => r.map(t => ({...t})))
          n[currentRow][col] = { letter: guess[col], state, animating: false }
          return n
        })
      }, col * 350 + 175)
    })

    setTimeout(() => {
      setIsRevealing(false)
      const newKeyStates = { ...keyStates }
      result.forEach((state, i) => {
        const letter = guess[i]
        if (newKeyStates[letter] !== "correct") {
          newKeyStates[letter] = state as KeyState
        }
      })
      setKeyStates(newKeyStates)

      // Build the final grid snapshot with this row's results applied
      const finalGrid = grid.map((row, ri) => {
        if (ri !== currentRow) return row.map(t => ({...t}))
        return row.map((t, ci) => ({ letter: guess[ci], state: result[ci], animating: false }))
      })

      const isWin = result.every(s => s === "correct")
      if (isWin) {
        setWon(true)
        setGameOver(true)
        setBounceRow(currentRow)
        setTimeout(() => setBounceRow(null), 700)
        saveResult(true, currentRow + 1, finalGrid)
        setTimeout(() => setShowModal(true), 800)
      } else if (currentRow >= MAX_GUESSES - 1) {
        setGameOver(true)
        showToast(TARGET, 3000)
        saveResult(false, MAX_GUESSES, finalGrid)
        setTimeout(() => setShowModal(true), 1200)
      } else {
        setCurrentRow(r => r + 1)
        setCurrentCol(0)
      }
    }, WORD_LENGTH * 350 + 200)
  }

  function buildShareText() {
    const rows = grid.slice(0, won ? currentRow + 1 : MAX_GUESSES).map(row => {
      if (row.every(t => t.state === "empty" || t.state === "filled")) return null
      return row.map(t => t.state === "correct" ? "🟠" : t.state === "present" ? "🟤" : "⬛").join("")
    }).filter(Boolean).join("\n")
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `ATINYWORDLE ${today}\n${won ? currentRow + 1 : "X"}/6 🏴‍☠️\n\n${rows}\n\n#ATEEZ #ATINY #ATINYTOWN`
  }

  const tileStyle = (state: TileState, animating: boolean, rowIndex: number): React.CSSProperties => {
    const size = "clamp(52px,13vw,62px)"
    const base: React.CSSProperties = {
      width: size, height: size,
      border: "2px solid",
      borderRadius: 4,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(24px,6vw,30px)",
      letterSpacing: "0.05em",
      transition: "border-color 0.1s",
      position: "relative",
      animation: bounceRow === rowIndex ? "wordle-bounce 0.6s ease" : animating ? "wordle-pop 0.1s ease" : "none",
    }
    if (state === "empty") return { ...base, background: "#141414", borderColor: "#2a2a2a", color: "#f0f0f0" }
    if (state === "filled") return { ...base, background: "#141414", borderColor: "#444", color: "#f0f0f0" }
    if (state === "correct") return { ...base, background: "#f97316", borderColor: "#f97316", color: "white", boxShadow: "0 0 20px rgba(249,115,22,0.4)", textShadow: "0 0 8px rgba(255,255,255,0.9),0 0 20px rgba(255,255,255,0.6)", WebkitTextStroke: "1px rgba(255,255,255,0.8)" }
    if (state === "present") return { ...base, background: "#854d0e", borderColor: "#854d0e", color: "#fbbf24" }
    return { ...base, background: "#262626", borderColor: "#262626", color: "#444" }
  }

  const keyStyle = (key: string): React.CSSProperties => {
    const state = keyStates[key]
    const base: React.CSSProperties = {
      height: 52, minWidth: key.length > 1 ? 56 : 36,
      padding: "0 8px",
      borderRadius: 6,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: key.length > 1 ? 11 : 13,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
      userSelect: "none",
      letterSpacing: "0.05em",
      border: "1px solid",
    }
    if (state === "correct") return { ...base, background: "#f97316", borderColor: "#f97316", color: "white", boxShadow: "0 0 12px rgba(249,115,22,0.3)", textShadow: "0 0 6px rgba(255,255,255,0.9)", WebkitTextStroke: "0.5px rgba(255,255,255,0.7)" }
    if (state === "present") return { ...base, background: "#854d0e", borderColor: "#854d0e", color: "#fbbf24" }
    if (state === "absent") return { ...base, background: "#1a1a1a", borderColor: "#1a1a1a", color: "#333" }
    return { ...base, background: "#1c1c1c", borderColor: "#2a2a2a", color: "#f0f0f0" }
  }

  const WIN_MSGS = ["GENIUS! 🔥","INCREDIBLE!","IMPRESSIVE!","SOLID! ⚔️","GOT THERE!","CLOSE CALL!"]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes wordle-pop { 0%{transform:scale(1)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes wordle-bounce { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-10px)} 50%{transform:translateY(-16px)} 75%{transform:translateY(-6px)} }
        @keyframes wordle-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 45%{transform:translateX(6px)} 65%{transform:translateX(-4px)} 85%{transform:translateX(4px)} }
        @keyframes wordle-flip { 0%{transform:rotateX(0)} 49%{transform:rotateX(90deg)} 50%{transform:rotateX(90deg)} 100%{transform:rotateX(0)} }
        @keyframes wordle-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wordle-toast { 0%{opacity:0;transform:translateX(-50%) translateY(-8px)} 10%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0} }
        @keyframes wordle-bar { from{width:0} to{width:var(--bar-w)} }
      `}</style>

      <div style={S.page}>
        <div style={S.gridBg} />
        <div style={S.glow} />

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: "#f0f0f0", color: "#0a0a0a", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, zIndex: 200, whiteSpace: "nowrap", animation: "wordle-toast 1.8s ease forwards" }}>
            {toast}
          </div>
        )}

        {/* Validating indicator */}
        {isValidating && (
          <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: "#1c1c1c", color: "#555", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, zIndex: 200, whiteSpace: "nowrap", border: "1px solid #2a2a2a" }}>
            Checking...
          </div>
        )}

        {/* Header */}
        <header style={S.header}>
          <div style={S.headerInner}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <button style={{ ...S.iconBtn, fontSize: 20, lineHeight: 1, color: "#555" }} title="Back to ATINYTOWN">
                  ×
                </button>
              </Link>
              <div style={S.logoTitle}>ATINYWORDLE</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowHelp(h => !h)}
                style={{ ...S.iconBtn, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, ...(showHelp ? { background: "#f97316", borderColor: "#f97316", color: "white" } : {}) }}>?</button>
              <button onClick={() => { loadStats(); setShowStats(true) }} style={S.iconBtn}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="8" width="3" height="7" fill="currentColor" rx="1"/>
                  <rect x="6" y="4" width="3" height="11" fill="currentColor" rx="1"/>
                  <rect x="11" y="1" width="3" height="14" fill="currentColor" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
          <div style={S.statsStrip}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
              <span>Streak: {stats.streak}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
              <span>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#f97316" }} />
              <span>Resets midnight KST</span>
            </div>
          </div>

          {/* Help banner — persists until ? clicked again */}
          {showHelp && (
            <div style={{ marginTop: 12, width: "100%", background: "#141414", border: "1px solid #f97316", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, animation: "wordle-fadein 0.2s ease both" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.1em", color: "#f97316" }}>HOW TO PLAY</span>
                <button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, padding: 0 }}>✕</button>
              </div>
              <p style={{ color: "#8b949e", fontSize: 12, margin: 0, lineHeight: 1.6 }}>
                Guess the 5-letter ATEEZ word in <strong style={{ color: "#f0f0f0" }}>6 tries</strong>. After each guess, tiles show how close you are:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { color: "#f97316", border: "#f97316", letter: "A", label: "Right letter, right spot" },
                  { color: "#854d0e", border: "#854d0e", letter: "T", label: "Right letter, wrong spot", textColor: "#fbbf24" },
                  { color: "#262626", border: "#262626", letter: "Z", label: "Letter not in the word", textColor: "#444" },
                ].map(({ color, border, letter, label, textColor }) => (
                  <div key={letter} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: color, border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: textColor || "white", flexShrink: 0 }}>{letter}</div>
                    <span style={{ color: "#8b949e", fontSize: 12 }}>{label}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: "#555", fontSize: 11, margin: 0, borderTop: "1px solid #2a2a2a", paddingTop: 8 }}>
                A hint appears after 3 failed guesses. New word every day at midnight KST 🏴‍☠️
              </p>
            </div>
          )}
        </header>

        <main style={{ width: "100%", maxWidth: 500, padding: "20px 20px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>

          {/* Hint — only shows after 3rd failed guess */}
          {(currentRow >= 3 || gameOver || alreadyPlayed) && (
            <div style={S.hintStrip}>
              <div style={S.hintTag}>HINT</div>
              <span>{todayData.hint}</span>
            </div>
          )}

          {/* Already played banner */}
          {alreadyPlayed && isReturning && (
            <div style={{ width: "100%", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.4)", borderRadius: 10, padding: "14px 18px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#f97316", marginBottom: 4 }}>
                ALREADY PLAYED TODAY
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                Come back tomorrow for a new word 🏴‍☠️
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {grid.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 6, animation: shakeRow === ri ? "wordle-shake 0.4s ease" : "none" }}>
                {row.map((tile, ci) => (
                  <div key={ci} style={tileStyle(tile.state, tile.animating, ri)}>
                    {tile.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Keyboard */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, alignItems: "center", position: "relative" }}>
            {(alreadyPlayed || (gameOver && !showModal)) && (
              <div style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "not-allowed" }} />
            )}
            {KB_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                {row.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    disabled={alreadyPlayed || gameOver}
                    style={{
                      ...keyStyle(key),
                      ...((alreadyPlayed || gameOver) ? { opacity: 0.25, cursor: "not-allowed", filter: "grayscale(1)" } : {})
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {!isSignedIn && isLoaded && (
            <p style={{ color: "#555", fontSize: 11, textAlign: "center" }}>
              <Link href="/" style={{ color: "#f97316" }}>Sign in</Link> to save your streak across devices
            </p>
          )}
        </main>

        {/* End modal */}
        {showModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowModal(false)}>
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 12, padding: "32px 28px", width: "100%", maxWidth: 360, textAlign: "center", position: "relative", overflow: "hidden", animation: "wordle-fadein 0.4s ease both" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />
              <div style={{ fontSize: 48, marginBottom: 12 }}>{won ? "🏴‍☠️" : "💀"}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: "0.1em", color: "#f0f0f0", marginBottom: 6 }}>
                {won ? WIN_MSGS[Math.min(currentRow, 5)] : "DEFEATED"}
              </div>
              <div style={{ color: "#555", fontSize: 14, marginBottom: 20, fontStyle: "italic" }}>
                {won ? `Solved in ${currentRow + 1} guess${currentRow === 0 ? "" : "es"}!` : "The word escaped you today..."}
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.15em", color: "#f97316", textShadow: "0 0 20px rgba(249,115,22,0.4)", marginBottom: 4 }}>{TARGET}</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 20 }}>{todayData.def}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
                {[["Guesses", won ? currentRow + 1 : "X"], ["Streak", stats.streak], ["Played", stats.played]].map(([label, val]) => (
                  <div key={label as string} style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 8px" }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#f97316", display: "block" }}>{val}</span>
                    <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.05em" }}>{label}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => { navigator.clipboard.writeText(buildShareText()).then(() => showToast("Copied!")) }}
                style={{ width: "100%", background: "#f97316", border: "none", borderRadius: 8, padding: 14, color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(249,115,22,0.3)", marginBottom: 8 }}>
                🏴‍☠️ Share Result
              </button>
              <div style={{ fontSize: 12, color: "#555" }}>
                Next word in <span style={{ color: "#f97316", fontFamily: "'Bebas Neue',sans-serif", fontSize: 15 }}><CountdownTimer /></span>
              </div>
            </div>
          </div>
        )}

        {/* Stats modal */}
        {showStats && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowStats(false)}>
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 12, padding: "32px 28px", width: "100%", maxWidth: 360, position: "relative", overflow: "hidden", animation: "wordle-fadein 0.4s ease both" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#f97316,transparent)" }} />
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: "0.1em", color: "#f0f0f0", marginBottom: 20, textAlign: "center" }}>STATISTICS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
                {[["Played", stats.played], ["Streak", stats.streak], ["Best", stats.best]].map(([label, val]) => (
                  <div key={label as string} style={{ background: "#1c1c1c", border: "1px solid #2a2a2a", borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#f97316", display: "block" }}>{val}</span>
                    <span style={{ fontSize: 10, color: "#555", letterSpacing: "0.05em" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: "0.15em", color: "#555", marginBottom: 12 }}>GUESS DISTRIBUTION</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                {[1,2,3,4,5,6].map(n => {
                  const count = stats.dist[n] || 0
                  const max = Math.max(1, ...Object.values(stats.dist).map(Number))
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: "#555", width: 12, textAlign: "right" }}>{n}</span>
                      <div style={{ flex: 1, height: 22, background: "#1c1c1c", borderRadius: 3, overflow: "hidden", border: "1px solid #2a2a2a" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#f97316", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, minWidth: count > 0 ? 28 : 0, transition: "width 0.6s ease" }}>
                          {count > 0 && <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 12, color: "white" }}>{count}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => setShowStats(false)}
                style={{ width: "100%", background: "#f97316", border: "none", borderRadius: 8, padding: 14, color: "white", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function CountdownTimer() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setUTCHours(15, 0, 0, 0)
      if (midnight <= now) midnight.setUTCDate(midnight.getUTCDate() + 1)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTime(`${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <>{time}</>
}