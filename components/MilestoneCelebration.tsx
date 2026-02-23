"use client"

import { useState, useEffect, useRef } from "react"

// ── Types ──────────────────────────────────────────────────────
interface MilestoneEvent {
  videoId: string
  title: string
  thumbnail: string
  views: number
  milestone: number
  milestoneKey: string
}

// ── Helpers ────────────────────────────────────────────────────
function getMilestone(views: number): number | null {
  if (views >= 100_000_000) {
    const band = Math.floor(views / 50_000_000) * 50_000_000
    return band >= 100_000_000 ? band : null
  }
  const band = Math.floor(views / 5_000_000) * 5_000_000
  return band >= 5_000_000 ? band : null
}

function formatMilestone(n: number): string {
  if (n >= 1_000_000_000) return `${n / 1_000_000_000}B`
  if (n >= 1_000_000) return `${n / 1_000_000}M`
  return `${n / 1_000}K`
}

function getMilestoneKey(videoId: string, milestone: number) {
  return `milestone_dismissed_${videoId}_${milestone}`
}
function isDismissed(videoId: string, milestone: number) {
  try { return localStorage.getItem(getMilestoneKey(videoId, milestone)) === "true" } catch { return false }
}
function saveDismiss(videoId: string, milestone: number) {
  try { localStorage.setItem(getMilestoneKey(videoId, milestone), "true") } catch {}
}

// ── Confetti ───────────────────────────────────────────────────
function useConfetti(trigger: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (trigger === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const COLORS = ["#f97316","#fbbf24","#fb923c","#ffffff","#fed7aa","#FFD700","#fdba74"]
    type Shape = "rect" | "circle" | "ribbon"
    const particles: {
      x:number; y:number; vx:number; vy:number; color:string;
      size:number; rotation:number; rotSpeed:number; shape:Shape; opacity:number
    }[] = []

    for (let i = 0; i < 150; i++) {
      const angle = (Math.random() * 160 + 190) * Math.PI / 180
      const speed = Math.random() * 14 + 4
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 120,
        y: canvas.height * 0.38,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 9 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: (["rect","circle","ribbon"] as Shape[])[Math.floor(Math.random() * 3)],
        opacity: 1,
      })
    }

    let raf: number
    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.vx *= 0.99
        p.rotation += p.rotSpeed
        if (p.y > canvas!.height * 0.65) p.opacity -= 0.025
        if (p.opacity <= 0) { particles.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation * Math.PI / 180)
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill() }
        else if (p.shape === "ribbon") { ctx.fillRect(-p.size*1.5,-p.size/4,p.size*3,p.size/2) }
        else { ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size) }
        ctx.restore()
      }
      if (particles.length > 0) raf = requestAnimationFrame(draw)
      else ctx.clearRect(0, 0, canvas!.width, canvas!.height)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [trigger])

  return canvasRef
}

// ── Card Front ─────────────────────────────────────────────────
function MilestoneCardFront({ event }: { event: MilestoneEvent }) {
  const [imgError, setImgError] = useState(false)
  const label = formatMilestone(event.milestone)
  const shortTitle = event.title
    .replace(/ATEEZ \(에이티즈\) - /i, "")
    .replace(/ Official MV$/i, "")
    .replace(/'/g, "\u2019")

  return (
    <div style={{
      width: 300, minHeight: 460, borderRadius: 20, overflow: "hidden",
      background: "linear-gradient(160deg,#111827,#0d1117)",
      border: "2px solid #FFD700",
      boxShadow: "0 0 0 2px #FFD700,0 0 40px rgba(255,215,0,0.35),0 0 80px rgba(249,115,22,0.15),0 24px 60px rgba(0,0,0,0.8)",
    }}>
      <div style={{ height: 4, background: "linear-gradient(90deg,#FFD700,#FFA500,#f97316,#fbbf24,#FFD700)", backgroundSize: "300% 100%", animation: "ms-shimmer 2.5s linear infinite" }} />
      <div style={{ padding: 14 }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" }}>MILESTONE</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>★ LEGENDARY</span>
            </div>
            <div style={{ color: "white", fontWeight: 900, fontSize: 15, lineHeight: 1.3, maxWidth: 160 }}>{shortTitle}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ color: "#484f58", fontSize: 9 }}>VIEWS</div>
            <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 22, lineHeight: 1 }}>{label}</div>
          </div>
        </div>

        {/* Thumbnail */}
        <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", border: "2px solid #FFD700", aspectRatio: "16/9", marginBottom: 12, background: "linear-gradient(160deg,rgba(249,115,22,0.12),rgba(255,215,0,0.05))" }}>
          {!imgError
            ? <img src={event.thumbnail} alt={event.title} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 40, opacity: 0.3 }}>🎬</span></div>
          }
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(255,215,0,0.07),transparent 50%,rgba(249,115,22,0.04))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to top,rgba(13,17,23,0.95),transparent)" }} />
          <div style={{ position: "absolute", bottom: 7, left: 8, background: "rgba(0,0,0,0.75)", borderRadius: 6, padding: "2px 8px", color: "#FFD700", fontSize: 10, fontWeight: 800 }}>
            🎊 {label} VIEWS
          </div>
        </div>

        {/* Stats */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
            {[
              { l: "MILESTONE", v: label + " views" },
              { l: "TOTAL VIEWS", v: (event.views / 1_000_000).toFixed(1) + "M" },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#484f58", fontSize: 9, fontWeight: 700 }}>{l}</span>
                <span style={{ color: "#e6edf3", fontSize: 10, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(249,115,22,0.06)", borderRadius: 8, padding: "7px 10px", border: "1px solid rgba(249,115,22,0.15)", marginBottom: 10 }}>
          <p style={{ color: "#484f58", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 2px" }}>Just happened</p>
          <p style={{ color: "#8b949e", fontSize: 10, lineHeight: 1.5, margin: 0 }}>This MV just crossed {label} views — awesome job ATINYs! 🔥</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#484f58", fontSize: 9 }}>ATINYTOWN · MV Tracker</span>
          <span style={{ color: "#FFD700", fontSize: 9, fontWeight: 700 }}>★ MILESTONE</span>
        </div>
      </div>
    </div>
  )
}

// ── Card Back ──────────────────────────────────────────────────
function MilestoneCardBack({ event }: { event: MilestoneEvent }) {
  const label = formatMilestone(event.milestone)
  return (
    <div style={{
      width: 300, borderRadius: 20,
      background: "linear-gradient(160deg,#111827,#0d1117)",
      border: "2px solid rgba(249,115,22,0.4)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", minHeight: 460, gap: 12, position: "relative", overflow: "hidden", padding: 20,
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(45deg,#f97316 0px,#f97316 1px,transparent 1px,transparent 10px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center,rgba(249,115,22,0.08),transparent 70%)" }} />
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#f97316,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 0 40px rgba(249,115,22,0.6)", zIndex: 1 }}>🎊</div>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 20, letterSpacing: ".06em" }}>ATINY<span style={{ color: "#58a6ff" }}>TOWN</span></div>
        <div style={{ color: "#484f58", fontSize: 10, marginTop: 4 }}>{label} Views Milestone</div>
      </div>
    </div>
  )
}

// ── Flip Modal ─────────────────────────────────────────────────
function MilestoneFlipModal({
  event, index, total, onCelebrate, onDontShow, onNext, onPrev,
}: {
  event: MilestoneEvent; index: number; total: number
  onCelebrate: () => void; onDontShow: () => void
  onNext: () => void; onPrev: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [confettiTick, setConfettiTick] = useState(0)
  const canvasRef = useConfetti(confettiTick)

  useEffect(() => {
    setFlipped(false)
    const t = setTimeout(() => { setFlipped(true); setConfettiTick(n => n + 1) }, 320)
    return () => clearTimeout(t)
  }, [event.milestoneKey])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCelebrate() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onCelebrate])

  function handleCelebrate() {
    setConfettiTick(n => n + 1)
    setTimeout(onCelebrate, 350)
  }

  const btnBase: React.CSSProperties = {
    borderRadius: 10, padding: "9px 18px", fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
    transition: "all 0.15s",
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)", padding: 16 }}
      onClick={handleCelebrate}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "rgba(249,115,22,0.1)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }} onClick={e => e.stopPropagation()}>
        {/* Queue dots */}
        {total > 1 && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, background: i === index ? "#f97316" : "rgba(255,255,255,0.2)", transition: "all 0.25s" }} />
            ))}
          </div>
        )}

        {/* Flip card */}
        <div style={{ perspective: 1200, cursor: "pointer" }} onClick={() => setFlipped(f => !f)}>
          <div style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform 0.75s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)" }}>
            <div style={{ backfaceVisibility: "hidden" }}>
              <MilestoneCardFront event={event} />
            </div>
            <div style={{ position: "absolute", top: 0, left: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <MilestoneCardBack event={event} />
            </div>
          </div>
        </div>

        <p style={{ color: "#484f58", fontSize: 11, textAlign: "center" }}>Click card to flip · Esc or click outside to dismiss</p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {total > 1 && (
            <button onClick={onPrev} style={{ ...btnBase, background: "rgba(255,255,255,0.05)", color: "#8b949e", border: "1px solid rgba(255,255,255,0.1)", padding: "9px 14px" }}>‹</button>
          )}
          <button
            onClick={e => { e.stopPropagation(); saveDismiss(event.videoId, event.milestone); onDontShow() }}
            style={{ ...btnBase, background: "#f97316", color: "white", border: "none", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}
          >
            Don&apos;t show until next milestone
          </button>
          {total > 1 && (
            <button onClick={onNext} style={{ ...btnBase, background: "rgba(255,255,255,0.05)", color: "#8b949e", border: "1px solid rgba(255,255,255,0.1)", padding: "9px 14px" }}>›</button>
          )}
        </div>

        {total > 1 && <p style={{ color: "#484f58", fontSize: 10 }}>{index + 1} of {total} milestones</p>}
      </div>
    </div>
  )
}

// ── Dev preview ────────────────────────────────────────────────
const DEV_MILESTONES: MilestoneEvent[] = [
  {
    videoId: "P5HKNS5iQLg",
    title: "ATEEZ (에이티즈) - 'FEVER' Official MV",
    thumbnail: "https://img.youtube.com/vi/P5HKNS5iQLg/mqdefault.jpg",
    views: 50_200_000, milestone: 50_000_000, milestoneKey: "dev_fever_50M",
  },
  {
    videoId: "fF8EVBJpkp0",
    title: "ATEEZ (에이티즈) - 'Fireworks' Official MV",
    thumbnail: "https://img.youtube.com/vi/fF8EVBJpkp0/mqdefault.jpg",
    views: 100_400_000, milestone: 100_000_000, milestoneKey: "dev_fireworks_100M",
  },
]
const IS_DEV = process.env.NODE_ENV === "development"

// ── Main export ────────────────────────────────────────────────
export default function MilestoneCelebration() {
  const [queue, setQueue] = useState<MilestoneEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (IS_DEV) {
      setTimeout(() => {
        // Still respect dismissals in dev so you can test the full flow
        const visible = DEV_MILESTONES.filter(e => !isDismissed(e.videoId, e.milestone))
        setQueue(visible)
      }, 800)
    } else {
      checkMilestones()
    }
  }, [])

  async function checkMilestones() {
    try {
      const res = await fetch("/api/youtube-tracker")
      if (!res.ok) return
      const data = await res.json()
      const videos: Array<{ videoId: string; title: string; viewCount: number; thumbnail: string; viewsGainedHour: number }> = data.videos ?? []
      const hits: MilestoneEvent[] = []
      for (const video of videos) {
        const milestone = getMilestone(video.viewCount)
        if (!milestone) continue
        if (isDismissed(video.videoId, milestone)) continue
        const crossedRecently = (video.viewCount - (video.viewsGainedHour ?? 0)) < milestone
        if (!crossedRecently) continue
        hits.push({
          videoId: video.videoId, title: video.title,
          thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
          views: video.viewCount, milestone,
          milestoneKey: getMilestoneKey(video.videoId, milestone),
        })
      }
      hits.sort((a, b) => b.milestone - a.milestone)
      setQueue(hits)
    } catch (err) {
      console.error("Milestone check failed:", err)
    }
  }

  function dismissCurrent() {
    setQueue(prev => {
      const next = prev.filter((_, i) => i !== currentIndex)
      setCurrentIndex(i => Math.min(i, Math.max(0, next.length - 1)))
      return next
    })
  }

  if (queue.length === 0) return null

  return (
    <>
      <style>{`@keyframes ms-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      <MilestoneFlipModal
        key={queue[currentIndex].milestoneKey}
        event={queue[currentIndex]}
        index={currentIndex}
        total={queue.length}
        onCelebrate={dismissCurrent}
        onDontShow={dismissCurrent}
        onNext={() => setCurrentIndex(i => (i + 1) % queue.length)}
        onPrev={() => setCurrentIndex(i => (i - 1 + queue.length) % queue.length)}
      />
    </>
  )
}