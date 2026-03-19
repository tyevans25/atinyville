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
import WelcomeCardModal from "@/components/WelcomeCardModal"
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

// Welcome card data — mirrors the welcome-ot8 collection in PhotocardGallery
const WELCOME_CARD = {
  id: "welcome-ot8-ot8-1",
  collectionId: "welcome-ot8",
  collectionName: "Welcome to ATINYville",
  groupId: "special",
  groupLabel: "Special",
  rarity: "legendary" as const,
  pool: "event" as const,
  memberId: "ot8",
  memberName: "OT8",
  cardNumber: 1,
  color: "#f97316",
  secondColor: "#fbbf24",
  imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/v1773436841/photocards/welcome-ot8/ot81.mp4", // ← update versionId after upload
}

const BIRTHDAY_MEMBER_META: Record<string, {
  memberName: string; color: string; secondColor: string
  collectionName: string; groupLabel: string; imageUrl: string
}> = {
  hj:  { memberName: "Hongjoong", color: "#FF6B35", secondColor: "#FF9A6C", collectionName: "Hongjoong's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/hj/hj1.mp4" },
  sh:  { memberName: "Seonghwa",  color: "#B48EE0", secondColor: "#D8B4FE", collectionName: "Seonghwa's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/sh/sh1.mp4" },
  yh:  { memberName: "Yunho",     color: "#4FC3F7", secondColor: "#BAE6FD", collectionName: "Yunho's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/yh/yh1.mp4" },
  ys:  { memberName: "Yeosang",   color: "#81C784", secondColor: "#BBF7D0", collectionName: "Yeosang's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/ys/ys1.mp4" },
  sn:  { memberName: "San",       color: "#F06292", secondColor: "#FBCFE8", collectionName: "San's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/sn/sn1.mp4" },
  mg:  { memberName: "Mingi",     color: "#FFD54F", secondColor: "#FEF08A", collectionName: "Mingi's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/mg/mg1.mp4" },
  wy:  { memberName: "Wooyoung",  color: "#CE93D8", secondColor: "#E9D5FF", collectionName: "Wooyoung's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/wy/wy1.mp4" },
  jh:  { memberName: "Jongho",    color: "#4DD0E1", secondColor: "#A5F3FC", collectionName: "Jongho's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/jh/jh1.mp4" },
  test: { memberName: "Test Member", color: "#f97316", secondColor: "#fbbf24", collectionName: "Test Member's Birthday", groupLabel: "Birthdays", imageUrl: "https://res.cloudinary.com/dbz7nif6b/video/upload/photocards/birthdays/test/test1.mp4" },
}

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const [showGiftBanner, setShowGiftBanner] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [birthdayCard, setBirthdayCard] = useState<typeof BIRTHDAY_MEMBER_META[string] & { id: string } | null>(null)

  // Check if user has unclaimed welcome card
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    async function checkWelcome() {
      try {
        const res = await fetch("/api/photocards/welcome")
        if (res.ok) {
          const data = await res.json()
          if (data.unclaimed) setShowGiftBanner(true)
        }
      } catch {}
    }
    checkWelcome()
  }, [isLoaded, isSignedIn, user])

  // Check if today is a member's birthday
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return
    async function checkBirthday() {
      try {
        const res = await fetch("/api/photocards/birthday")
        if (res.ok) {
          const data = await res.json()
          if (data.card) setBirthdayCard(data.card)
        }
      } catch {}
    }
    checkBirthday()
  }, [isLoaded, isSignedIn, user])

  // Auto-carousel
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

  function handleGiftClick() {
    setBannerDismissed(true)
    setShowGiftBanner(false)
    setShowWelcomeModal(true)
  }

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        {/* Background atmosphere */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        {/* 🎁 Gift banner — thin bar below navbar */}
        {showGiftBanner && !bannerDismissed && (
          <>
            <style>{`@keyframes slideDown { from{opacity:0;transform:translateY(-100%)} to{opacity:1;transform:translateY(0)} }`}</style>
            <style>{`
              @keyframes tickerScroll {
                0% { transform: translateX(0) }
                100% { transform: translateX(-50%) }
              }
            `}</style>
            <div style={{
              position: "fixed", top: 52, left: 0, right: 0, zIndex: 50,
              background: "linear-gradient(90deg,#1e3a8a,#1d4ed8,#3b82f6,#60a5fa,#3b82f6,#1d4ed8,#1e3a8a)",
              animation: "slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both",
              display: "flex", alignItems: "center",
              height: 34, overflow: "hidden",
              boxShadow: "0 2px 12px rgba(59,130,246,0.4)",
            }}>
              {/* scrolling ticker */}
              <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
                <div style={{
                  display: "flex", gap: 0,
                  animation: "tickerScroll 32s linear infinite",
                  width: "max-content",
                }}>
                  {[...Array(6)].map((_, i) => (
                    <span key={i} style={{ color: "white", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", paddingRight: 48 }}>
                      🎁 You have a special gift waiting — a legendary photocard, yours to keep forever &nbsp;✦
                    </span>
                  ))}
                </div>
              </div>
              {/* claim + dismiss — fixed right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", flexShrink: 0, background: "linear-gradient(to right, transparent, #1d4ed8 30%)" }}>
                <button
                  onClick={handleGiftClick}
                  style={{
                    background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6, padding: "4px 12px",
                    color: "white", fontWeight: 800, fontSize: 11,
                    cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                  }}
                >Claim →</button>
                <button
                  onClick={() => { setBannerDismissed(true); setShowGiftBanner(false) }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, padding: "0 2px", lineHeight: 1 }}
                >✕</button>
              </div>
            </div>
          </>
        )}

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: `${showGiftBanner && !bannerDismissed ? 108 : 76}px 24px 48px`, transition: "padding 0.3s ease" }}>

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
      {showWelcomeModal && (
        <WelcomeCardModal
          card={WELCOME_CARD}
          onClose={async () => {
            try { await fetch("/api/photocards/welcome", { method: "POST" }) } catch {}
            setShowWelcomeModal(false)
          }}
        />
      )}

      {birthdayCard && BIRTHDAY_MEMBER_META[birthdayCard.memberId] && (
        <WelcomeCardModal
          eyebrow={`Happy Birthday ${BIRTHDAY_MEMBER_META[birthdayCard.memberId].memberName}! 🎂`}
          title="A Birthday Gift For You 🎁"
          subtitle={`To celebrate ${BIRTHDAY_MEMBER_META[birthdayCard.memberId].memberName}'s birthday, every ATINY gets this limited legendary photocard — today only!`}
          claimLabel="Claim Birthday Card →"
          card={{
            ...BIRTHDAY_MEMBER_META[birthdayCard.memberId],
            id: birthdayCard.id,
            collectionId: `bday-${birthdayCard.memberId}`,
            groupId: "birthdays",
            rarity: "legendary" as const,
            pool: "event" as const,
            cardNumber: 1,
            memberId: birthdayCard.memberId,
          }}
          onClose={async () => {
            try { await fetch("/api/photocards/birthday", { method: "POST" }) } catch {}
            setBirthdayCard(null)
          }}
        />
      )}
    </>
  )
}