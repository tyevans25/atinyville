"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Navigation from "@/components/Navigation"
import DailyGoalSlide from "@/components/DailyGoalSlide"
import { useUser } from "@clerk/nextjs"
import ATEEZCalendar from "@/components/ATEEZCalendar"
import MVTracker from "@/components/MVTracker"
import MemberDots from "@/components/MemberDots"
import MilestoneCelebration from "@/components/MilestoneCelebration"
import Link from "next/link"

declare global {
  interface Window { twttr: any }
}

/* ── CAMPAIGN DATA ───────────────────────────────── */
const campaignUpdates = [
  { id: 1, component: <DailyGoalSlide /> },
  {
    id: 2,
    title: '"Adrenaline" Music Video Out Now!',
    description: 'ATEEZ\'s new music video for "Adrenaline" is here. Watch it now!',
    videoUrl: "https://www.youtube.com/embed/vqkfEUqjl6Y?si=N-36Jk4xkZN8bGas",
    urgent: true
  },
  {
    id: 3,
    title: "🫧 Listen GOLDEN HOUR: Part.4 Album Now",
    description: "Listen to ATEEZ's highly anticipated album on Spotify & Apple Music!",
    spotifyUrl: "https://open.spotify.com/embed/album/1FBxW4I6azDVjGallQ4wQk?utm_source=generator",
    urgent: true
  },
  {
    id: 4,
    title: "ATEEZ on KBS 1N2D!",
    description: "ATEEZ returns to 1N2D and are hilarious as usual!",
    videoUrl: "https://www.youtube.com/embed/bfhzzSQ2YCI?si=tLnuRMqykmkKpaRT",
    links: [{ url: "https://www.youtube.com/watch?v=bfhzzSQ2YCI", label: "Watch on YouTube" }],
    urgent: false
  },
  {
    id: 5,
    title: '"Adrenaline" on Music Bank!',
    description: 'Watch ATEEZ put on an electrifying performance of "Adrenaline" on Music Bank.',
    videoUrl: "https://www.youtube.com/embed/0PeuZB1FniM?si=4yVEpQKVTIxgffW3",
    links: [{ url: "https://www.youtube.com/watch?v=0PeuZB1FniM", label: "Watch on YouTube" }],
    urgent: false
  },
  {
    id: 6,
    title: '"NASA" on Music Bank!',
    description: 'Watch ATEEZ mesmerise with their performance of "NASA" on Music Bank.',
    videoUrl: "https://www.youtube.com/embed/CN3vOi5wKCk?si=r8vajgtQYQ_Smj0Q",
    links: [{ url: "https://www.youtube.com/watch?v=CN3vOi5wKCk", label: "Watch on YouTube" }],
    urgent: false
  },
  {
    id: 7,
    title: '"Adrenaline" on Music Core!',
    description: 'Watch ATEEZ put on an amazing performance of "Adrenaline" on Music Core.',
    videoUrl: "https://www.youtube.com/embed/tDuZLK78BEk?si=qGPDk8TS_ymtON66",
    links: [{ url: "https://www.youtube.com/watch?v=tDuZLK78BEk", label: "Watch on YouTube" }],
    urgent: false
  },
  {
    id: 8,
    title: '"NASA" on Music Core!',
    description: 'Watch ATEEZ mesmerise with their performance of "NASA" on Music Core.',
    videoUrl: "https://www.youtube.com/embed/mNLzeeTiYd8?si=d3RvFTthYEMK23d6",
    links: [{ url: "https://www.youtube.com/watch?v=mNLzeeTiYd8", label: "Watch on YouTube" }],
    urgent: false
  },
  {
    id: 9,
    title: "YUNHO on Lee Mujin Service",
    description: "Watch Yunho shine on Lee Mujin Service!",
    videoUrl: "https://www.youtube.com/embed/p4Q221AMiss?si=x_7DlMMnfpj9LAjb",
    links: [{ url: "https://www.youtube.com/watch?v=p4Q221AMiss", label: "Watch on YouTube" }],
    urgent: false
  },
]

export default function Home() {
  const { isSignedIn } = useUser()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)

  useEffect(() => {
    if (carouselPaused) return
    const slideTime = currentSlide === 0 ? 10000 : 7000
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % campaignUpdates.length)
    }, slideTime)
    return () => clearInterval(interval)
  }, [carouselPaused, currentSlide])

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % campaignUpdates.length)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + campaignUpdates.length) % campaignUpdates.length)

  const slide = campaignUpdates[currentSlide]

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        {/* Background atmosphere */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "76px 24px 48px" }}>

          <div>
            <MemberDots />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* ── CAROUSEL ── */}
            <div
              style={{
                borderRadius: 14, overflow: "hidden", position: "relative",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(22,32,56,0.85)",
              }}
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <div style={{
                padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(255,255,255,0.02)"
              }}>
                <span style={{ fontSize: 14 }}>🎵</span>
                <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>Overview</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  {campaignUpdates.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} style={{
                      width: i === currentSlide ? 26 : 6, height: 6, borderRadius: 3,
                      background: i === currentSlide ? "#58a6ff" : "rgba(255,255,255,0.15)",
                      border: "none", cursor: "pointer", transition: "all 0.25s", padding: 0
                    }} />
                  ))}
                </div>
              </div>

              <div>
                {slide.component ? (
                  <div style={{ minHeight: 260 }}>
                    {slide.component}
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row" style={{ minHeight: 260 }}>
                    {slide.videoUrl && (
                      <div className="w-full md:w-[340px] md:flex-shrink-0" style={{ background: "#000", aspectRatio: "16/9" }}>
                        <iframe
                          width="100%" height="100%"
                          src={slide.videoUrl}
                          title={slide.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ display: "block", border: "none", width: "100%", height: "100%" }}
                        />
                      </div>
                    )}
                    {slide.spotifyUrl && (
                      <div className="w-full md:w-[340px] md:flex-shrink-0" style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "16px 0" }}>
                        <iframe
                          src={slide.spotifyUrl}
                          width="100%" height="152"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                      {slide.urgent && (
                        <span style={{
                          background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800,
                          padding: "2px 8px", borderRadius: 4, textTransform: "uppercase",
                          letterSpacing: "0.05em", display: "inline-block", marginBottom: 10, width: "fit-content"
                        }}>Out Now</span>
                      )}
                      <h3 style={{ color: "#e6edf3", fontSize: 19, fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>
                        {slide.title}
                      </h3>
                      <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                        {slide.description}
                      </p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {slide.links?.map((link, index) => (
                          <Button
                            key={index}
                            onClick={() => window.open(link.url, '_blank')}
                            style={{
                              background: "#e6edf3", color: "#0d1117",
                              fontSize: 13, fontWeight: 700, borderRadius: 8,
                              padding: "8px 18px", border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", gap: 6
                            }}
                          >
                            {link.label} <ExternalLink style={{ width: 13, height: 13 }} />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {[
                { fn: prevSlide, side: "left" as const, label: "‹" },
                { fn: nextSlide, side: "right" as const, label: "›" },
              ].map(({ fn, side, label }) => (
                <button key={side} onClick={fn} style={{
                  position: "absolute", [side]: 12, top: "50%",
                  transform: "translateY(-50%) translateY(14px)",
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(22,32,56,0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#8b949e", fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{label}</button>
              ))}
            </div>

            {/* ── CALENDAR ── */}
            <div style={{
              borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(22,32,56,0.85)", overflow: "hidden"
            }}>
              <ATEEZCalendar />
            </div>

            {/* ── MV TRACKER ── */}
            <div style={{
              borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(22,32,56,0.85)", overflow: "hidden"
            }}>
              <MVTracker />
            </div>

            {/* ── ATINYWORDLE CTA ── */}
            <div style={{
              borderRadius: 14, overflow: "hidden",
              border: "1px solid rgba(249,115,22,0.2)",
              background: "rgba(22,32,56,0.85)",
            }}>
              <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #f97316, #ea580c, transparent)" }} />
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-6 md:p-7">
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: "#e6edf3", fontSize: 20, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "inline-grid", gridTemplateColumns: "repeat(3,7px)", gap: 2 }}>
                      {["#f97316","#f97316","#262626","#854d0e","#f97316","#262626","#262626","#854d0e","#f97316"].map((c, i) => (
                        <span key={i} style={{ width: 7, height: 7, background: c, borderRadius: 1, display: "block" }} />
                      ))}
                    </span>
                    ATINYWORDLE
                  </h3>
                  <p style={{ color: "#8b949e", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
                    Guess the daily 5-letter ATEEZ word in 6 tries. New word every day at midnight KST — can you keep your streak alive?
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Daily word", "Streak tracking", "Share results"].map(tag => (
                      <span key={tag} style={{
                        fontSize: 11, padding: "3px 12px", borderRadius: 999,
                        background: "rgba(249,115,22,0.08)", color: "#f97316",
                        border: "1px solid rgba(249,115,22,0.2)"
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <Link href="/wordle">
                    <button style={{
                      padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                      background: "#f97316", color: "white",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      boxShadow: "0 0 24px rgba(249,115,22,0.3)"
                    }}>
                      🟠 Play Today
                    </button>
                  </Link>
                  {!isSignedIn && (
                    <p style={{ color: "#484f58", fontSize: 11, marginTop: 8 }}>Sign in to save your streak</p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <p style={{ color: "#484f58", fontSize: 13 }}>Made for ATINYs</p>
            <p style={{ color: "#484f58", fontSize: 11, marginTop: 4, opacity: 0.7 }}>Not affiliated with KQ Entertainment</p>
          </div>
        </div>
      </div>
      <MilestoneCelebration />
    </>
  )
}