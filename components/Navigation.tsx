"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Trophy, TrendingUp, ShoppingBag, Map, Play } from "lucide-react"
import { UserButton, SignInButton, useUser } from "@clerk/nextjs"
import StreakModal from "@/components/StreakModal"

const getBadgeTier = (streak: number) => {
  if (streak >= 30) return { image: '/tiers/cap_RH.svg', label: "Captain's Right Hand" }
  if (streak >= 14) return { image: '/tiers/1st_mate.svg', label: 'First Mate' }
  if (streak >= 7)  return { image: '/tiers/corsair.svg',  label: 'Corsair' }
  if (streak >= 1)  return { image: '/tiers/wayfinder.svg',label: 'Wayfinder' }
  return { image: '/tiers/deckhand.svg', label: 'Deckhand' }
}

const navItems = [
  { name: "Streaming Hub", href: "/streaming",  icon: TrendingUp },
  { name: "Shop",          href: "/shop",        icon: ShoppingBag },
  { name: "Lore",          href: "/lore",        icon: Map },
  { name: "Variety",       href: "/variety",     icon: Play },
  { name: "Leaderboard",   href: "/leaderboard", icon: Trophy },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modalOpen, setModalOpen]           = useState(false)
  const [isMobile, setIsMobile]             = useState(false)
  const { isSignedIn, user }                = useUser()
  const [streakData, setStreakData]         = useState<{ currentStreak: number } | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (isSignedIn) fetchStreak()
  }, [isSignedIn])

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/user-stats')
      if (res.ok) {
        const data = await res.json()
        setStreakData({ currentStreak: data.stats.currentStreak })
      }
    } catch (e) { console.error(e) }
  }

  const badge = streakData ? getBadgeTier(streakData.currentStreak) : null

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(13,17,23,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px" }}>

          {/* Main row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 12 }}>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.01em" }}>
                <span style={{ color: "white", textShadow: "0 0 20px rgba(255,255,255,0.25)" }}>ATINY</span>
                <span style={{ color: "#58a6ff", textShadow: "0 0 20px rgba(88,166,255,0.6)" }}>TOWN</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
                {navItems.map(({ name, href, icon: Icon }) => (
                  <Link key={name} href={href} style={{ textDecoration: "none" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, color: "#8b949e", fontSize: 13, fontWeight: 500, transition: "color 0.15s, background 0.15s", cursor: "pointer", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.color = "white"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.color = "#8b949e"; (e.currentTarget as HTMLDivElement).style.background = "transparent" }}
                    >
                      <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                      <span>{name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

              {/* Desktop auth */}
              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", paddingLeft: 10, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
                  {isSignedIn ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {badge && streakData && streakData.currentStreak > 0 && (
                        <button
                          onClick={() => setModalOpen(true)}
                          style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
                        >
                          <Image src={badge.image} alt={badge.label} width={22} height={26} style={{ objectFit: "contain" }} />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
                            <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 500 }}>{badge.label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ fontSize: 10 }}>🔥</span>
                              <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{streakData.currentStreak}</span>
                            </div>
                          </div>
                        </button>
                      )}
                      <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    </div>
                  ) : (
                    <SignInButton mode="modal">
                      <button
                        style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, color: "white", padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.35)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)" }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent" }}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                </div>
              )}

              {/* Mobile: avatar + hamburger */}
              {isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isSignedIn ? (
                    <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
                  ) : (
                    <SignInButton mode="modal">
                      <button style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 7, color: "white", padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                  <button
                    onClick={() => setMobileMenuOpen(o => !o)}
                    style={{ background: "none", border: "none", color: "#8b949e", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" }}
                  >
                    {mobileMenuOpen
                      ? <X style={{ width: 20, height: 20 }} />
                      : <Menu style={{ width: 20, height: 20 }} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile dropdown */}
          {isMobile && mobileMenuOpen && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingBottom: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 6 }}>
                {navItems.map(({ name, href, icon: Icon }) => (
                  <Link key={name} href={href} style={{ textDecoration: "none" }} onClick={() => setMobileMenuOpen(false)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 8, color: "#8b949e", fontSize: 14, fontWeight: 500 }}>
                      <Icon style={{ width: 16, height: 16 }} />
                      <span>{name}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile streak row */}
              {isSignedIn && badge && streakData && streakData.currentStreak > 0 && (
                <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <button
                    onClick={() => { setModalOpen(true); setMobileMenuOpen(false) }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Image src={badge.image} alt={badge.label} width={22} height={26} style={{ objectFit: "contain" }} />
                      <div style={{ textAlign: "left" }}>
                        <p style={{ color: "#8b949e", fontSize: 11, margin: 0 }}>{badge.label}</p>
                        <p style={{ color: "white", fontSize: 11, fontWeight: 700, margin: 0 }}>
                          {user?.firstName || user?.username || 'ATINY'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px" }}>
                      <span style={{ fontSize: 12 }}>🔥</span>
                      <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{streakData.currentStreak}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <StreakModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}