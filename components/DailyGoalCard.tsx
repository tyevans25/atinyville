"use client"
// ── DailyGoalCard ──────────────────────────────────────────
import { useState, useEffect } from "react"
import { Clock, Target, TrendingUp } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

interface GoalData { target?: unknown; current?: unknown; userStreams?: unknown }
const safe = (v: unknown, f = 0) => typeof v === "number" && !Number.isNaN(v) ? v : f

const celebrationGifs = ['/gifs/complete/hongjoong.GIF','/gifs/complete/jongho.gif','/gifs/complete/mingi.GIF','/gifs/complete/minig-san.GIF','/gifs/complete/san.GIF','/gifs/complete/seonghwa.GIF','/gifs/complete/wooyoung.GIF','/gifs/complete/yeosang.GIF','/gifs/complete/yunho.GIF','/gifs/complete/yunho2.GIF']
const progressGifs   = ['/gifs/progress/hongjoong.GIF','/gifs/progress/jongho.GIF','/gifs/progress/jongho2.gif','/gifs/progress/mingi.GIF','/gifs/progress/san.GIF','/gifs/progress/seonghwa.GIF','/gifs/progress/wooyoung.GIF','/gifs/progress/yeosang.GIF','/gifs/progress/yunho.GIF']
const motivationGifs = ['/gifs/motivation/hongjoong.GIF','/gifs/motivation/hongjoong2.GIF','/gifs/motivation/jongho.GIF','/gifs/motivation/mingi.GIF','/gifs/motivation/san.GIF','/gifs/motivation/seonghwa.GIF','/gifs/motivation/wooyoung.GIF','/gifs/motivation/yeosang.gif','/gifs/motivation/yunho.GIF','/gifs/motivation/yunho2.GIF']

const shuffle = <T,>(a: T[]) => { const s=[...a]; for(let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]]} return s }
const pickGif  = (cur: number, tar: number) => { const p=cur/tar; return shuffle(p>=1?celebrationGifs:p>=0.33?progressGifs:motivationGifs)[0] }
const gifMsg   = (cur: number, tar: number) => { const p=cur/tar; return p>=1?"🎉 Goal Complete!":p>=0.33?"💪 You're getting there!":"🏴‍☠️ Let's go ATINY!" }

const bar = (pct: number) => (
  <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(pct,100)}%`, background: pct >= 100 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 4, transition: "width 0.5s" }} />
  </div>
)

export function DailyGoalCard() {
  const { isSignedIn } = useUser()
  const [goalData, setGoalData]         = useState<GoalData | null>(null)
  const [loading, setLoading]           = useState(true)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [currentGif, setCurrentGif]     = useState("")
  const [gifError, setGifError]         = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const { width, height } = useWindowSize()

  useEffect(() => { fetchGoalData(); const i = setInterval(fetchGoalData, 5*60*1000); return () => clearInterval(i) }, [isSignedIn])

  useEffect(() => {
    const tick = () => {
      const now = new Date(); const kst = new Date(now.getTime()+9*3600000)
      const next = new Date(kst); next.setUTCDate(next.getUTCDate()+1); next.setUTCHours(0,0,0,0)
      const diff = next.getTime()-kst.getTime()
      setTimeRemaining(`${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`)
    }
    tick(); const i = setInterval(tick, 60000); return () => clearInterval(i)
  }, [])

  useEffect(() => {
    if (!goalData) return
    const cur = safe(goalData.current); const tar = safe(goalData.target); const usr = safe(goalData.userStreams)
    setCurrentGif(pickGif(cur, tar)); setGifError(false)
    if (cur >= tar && usr > 0 && !showConfetti) {
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 5000)
      if (!hasPlayedSound) { new Audio('/sounds/fixon.mp3').play().catch(()=>{}); setHasPlayedSound(true) }
    }
  }, [goalData])

  const fetchGoalData = async () => {
    try { const r = await fetch("/api/community-daily-goal"); setGoalData(r.ok ? await r.json() : null) }
    catch { setGoalData(null) } finally { setLoading(false) }
  }

  const header = (title: string) => (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)" }}>
      <Clock style={{ width: 15, height: 15, color: "#58a6ff" }} />
      <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>{title}</span>
    </div>
  )

  if (loading) return <div>{header("Daily Goal")}<div style={{padding:20}}><p style={{color:"#484f58",fontSize:13}}>Loading...</p></div></div>
  if (!goalData) return <div>{header("Daily Goal")}<div style={{padding:"32px 20px",textAlign:"center"}}><Target style={{width:32,height:32,color:"rgba(255,255,255,0.1)",margin:"0 auto 10px"}}/><p style={{color:"#8b949e",fontSize:13}}>No daily goal set</p></div></div>

  const cur = safe(goalData.current); const tar = safe(goalData.target); const usr = safe(goalData.userStreams)
  const pct = tar > 0 ? (cur/tar)*100 : 0

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.3} />}
      <div>
        {header("Daily Community Goal")}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Timer */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 10px", alignSelf: "flex-start" }}>
            <Clock style={{ width: 12, height: 12, color: "#58a6ff" }} />
            <span style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{timeRemaining}</span>
          </div>

          <div>
            <p style={{ color: "#484f58", fontSize: 11, margin: "0 0 2px" }}>Today's Goal</p>
            <p style={{ color: "white", fontWeight: 800, fontSize: 17, margin: 0 }}>Stream ANY ATEEZ songs</p>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{cur.toLocaleString()}</span>
            <span style={{ color: "#484f58", fontSize: 15 }}>/ {tar.toLocaleString()}</span>
          </div>

          {bar(pct)}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#484f58", fontSize: 11 }}>{Math.max(tar-cur,0) > 0 ? `${Math.max(tar-cur,0).toLocaleString()} to go` : '🎉 Complete!'}</span>
            <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 600 }}>{Math.round(pct)}%</span>
          </div>

          {currentGif && !gifError && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", textAlign: "center" }}>
              <img src={currentGif} alt="reaction" style={{ width: 112, height: 112, borderRadius: 8, objectFit: "cover", margin: "0 auto 8px", display: "block" }} onError={() => setGifError(true)} />
              <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0 }}>{gifMsg(cur, tar)}</p>
            </div>
          )}

          {isSignedIn && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px" }}>
              <div>
                <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>Your contribution</p>
                <p style={{ color: "white", fontWeight: 800, fontSize: 16, margin: 0 }}>{usr} streams</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <TrendingUp style={{ width: 14, height: 14, color: "#22c55e", display: "block", marginLeft: "auto" }} />
                <p style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, margin: 0 }}>{cur > 0 ? ((usr/cur)*100).toFixed(1) : 0}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DailyGoalCard