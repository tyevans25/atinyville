"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { X, ChevronRight, Lock } from 'lucide-react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { type Badge, type UserStats } from '@/lib/badge-system'

const PhotocardGallery = dynamic(() => import('@/components/PhotocardGallery'), { ssr: false })

// ── Global keyframes (must render before any animation fires) ─
function GlobalStyles() {
  return (
    <style>{`
      @keyframes cardSpinReveal {
        0%   { opacity: 0; transform: translateZ(0) rotateY(-180deg) scale(0.3); }
        65%  { opacity: 1; transform: translateZ(0) rotateY(8deg) scale(1.05); }
        100% { opacity: 1; transform: translateZ(0) rotateY(0deg) scale(1); }
      }
      @-webkit-keyframes cardSpinReveal {
        0%   { opacity: 0; -webkit-transform: translateZ(0) rotateY(-180deg) scale(0.3); }
        65%  { opacity: 1; -webkit-transform: translateZ(0) rotateY(8deg) scale(1.05); }
        100% { opacity: 1; -webkit-transform: translateZ(0) rotateY(0deg) scale(1); }
      }
      @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
      @keyframes holoShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
      @keyframes cardPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
    `}</style>
  )
}



// ── Photocard catalog (mirrors PhotocardGallery) ──────────────
const CLOUD = "dbz7nif6b"

type Rarity = "common" | "rare" | "legendary"
type Pool   = "general" | "album" | "both" | "event"

interface Collection {
  id: string; name: string; groupLabel: string; groupId: string
  rarity: Rarity; pool: Pool
  folder: string; cardCounts: Record<string, number>
  ext?: string   // file extension, defaults to "jpg" — use "gif" for animated cards
}

const COLLECTIONS: Collection[] = [
  {
    id: "ghp4-concept", name: "Concept Photos",
    groupLabel: "GOLDEN HOUR Pt.4", groupId: "ghp4",
    rarity: "common", pool: "general",
    folder: "photocards/golden-hour-pt4", versionId: "v1773266724",
    cardCounts: { hj: 4, sh: 4, yh: 4, ys: 4, sn: 4, mg: 4, wy: 4, jh: 4 },
  },
  {
    id: "ghp4-apple", name: "Apple Music Exclusive",
    groupLabel: "GOLDEN HOUR Pt.4", groupId: "ghp4",
    rarity: "rare", pool: "general",
    folder: "photocards/ghp4-apple-music", versionId: "v1773405992",
    cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  },
  {
    id: "ghp4-target",
    name: "Target Exclusive",
    groupLabel: "GOLDEN HOUR Pt.4",
    groupId: "ghp4",
    rarity: "rare",
    pool: "general",
    folder: "photocards/ghp4-target",
    cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  },
    {
    id: "ghp4-soundwave",
    name: "Soundwave Exclusive",
    groupLabel: "GOLDEN HOUR Pt.4",
    groupId: "ghp4",
    rarity: "rare",
    pool: "general",
    folder: "photocards/ghp4-soundwave",
    cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  },
   {
    id: "ghp4-makestar",
    name: "Makestar Exclusive",
    groupLabel: "GOLDEN HOUR Pt.4",
    groupId: "ghp4",
    rarity: "rare",
    pool: "general",
    folder: "photocards/ghp4-makestar",
    cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  },
  {
    id: "welcome-ot8", name: "Welcome to ATINYTOWN",
    groupLabel: "Special", groupId: "special",
    rarity: "legendary", pool: "event",
    folder: "photocards/welcome-ot8", versionId: "v0000000000", // ← update after upload
    cardCounts: { ot8: 1 },
    ext: "mp4",
  },
  // ── Birthday collections ─────────────────────────
  { id: "bday-hj", name: "Hongjoong's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/hj", cardCounts: { hj: 10 }, ext: "mp4" },
  { id: "bday-sh", name: "Seonghwa's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/sh", cardCounts: { sh: 10 }, ext: "mp4" },
  { id: "bday-yh", name: "Yunho's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/yh", cardCounts: { yh: 10 }, ext: "mp4" },
  { id: "bday-ys", name: "Yeosang's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/ys", cardCounts: { ys: 10 }, ext: "mp4" },
  { id: "bday-sn", name: "San's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/sn", cardCounts: { sn: 10 }, ext: "mp4" },
  { id: "bday-mg", name: "Mingi's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/mg", cardCounts: { mg: 10 }, ext: "mp4" },
  { id: "bday-wy", name: "Wooyoung's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/wy", cardCounts: { wy: 10 }, ext: "mp4" },
  ...(process.env.NODE_ENV === "development" ? [{ id: "bday-test", name: "Test Member's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as const, pool: "event" as const, folder: "photocards/birthdays/test", cardCounts: { test: 10 }, ext: "mp4" }] : []),
  { id: "bday-jh", name: "Jongho's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary", pool: "event", folder: "photocards/birthdays/jh", cardCounts: { jh: 10 }, ext: "mp4" },
  // Add future collections here ↓
]

const MEMBER_META: Record<string, { name: string; color: string; secondColor: string }> = {
  hj:  { name: "Hongjoong", color: "#FF6B35", secondColor: "#FF9A6C" },
  sh:  { name: "Seonghwa",  color: "#B48EE0", secondColor: "#D8B4FE" },
  yh:  { name: "Yunho",     color: "#4FC3F7", secondColor: "#BAE6FD" },
  ys:  { name: "Yeosang",   color: "#81C784", secondColor: "#BBF7D0" },
  sn:  { name: "San",       color: "#F06292", secondColor: "#FBCFE8" },
  mg:  { name: "Mingi",     color: "#FFD54F", secondColor: "#FEF08A" },
  wy:  { name: "Wooyoung",  color: "#CE93D8", secondColor: "#E9D5FF" },
  jh:  { name: "Jongho",    color: "#4DD0E1", secondColor: "#A5F3FC" },
  ot8: { name: "ATEEZ",     color: "#f97316", secondColor: "#fbbf24" },
  test: { name: "Test Member", color: "#f97316", secondColor: "#fbbf24" },
}

interface PhotoCard {
  id: string; collectionId: string; collectionName: string
  groupId: string; groupLabel: string; rarity: Rarity; pool: Pool
  memberId: string; memberName: string; cardNumber: number
  color: string; secondColor?: string; imageUrl: string
}

function buildCatalog(): PhotoCard[] {
  const cards: PhotoCard[] = []
  for (const col of COLLECTIONS) {
    for (const [memberId, count] of Object.entries(col.cardCounts)) {
      const meta = MEMBER_META[memberId]
      for (let i = 1; i <= count; i++) {
        cards.push({
          id: `${col.id}-${memberId}-${i}`,
          collectionId: col.id, collectionName: col.name,
          groupId: col.groupId, groupLabel: col.groupLabel,
          rarity: col.rarity, pool: col.pool,
          memberId, memberName: meta.name, cardNumber: i,
          color: meta.color, secondColor: meta.secondColor,
          imageUrl: (() => {
            const ext = col.ext ?? "jpg"
            const resourceType = ["mov", "mp4", "webm"].includes(ext) ? "video" : "image"
            return `https://res.cloudinary.com/${CLOUD}/${resourceType}/upload/${col.folder}/${memberId}${i}.${ext}`
          })(),
        })
      }
    }
  }
  return cards
}

const ALL_CARDS = buildCatalog()

// ── Tier helpers ──────────────────────────────────────────────
const getTierInfo = (streak: number) => {
  if (streak >= 30) return { image: '/tiers/cap_RH.svg',    name: "Captain's Right Hand", description: "Standing closest to the helm as the Captain's most trusted advisor.", next: null, progress: 100, rank: 4 }
  if (streak >= 14) return { image: '/tiers/1st_mate.svg',  name: 'First Mate',  description: "You've survived treacherous paths and made the trusted circle.", next: "Captain's Right Hand", target: 30, progress: ((streak-14)/16)*100, rank: 3 }
  if (streak >= 7)  return { image: '/tiers/corsairs.svg',   name: 'Corsair',     description: "A daring pirate of the high seas. Keep moving forward.", next: 'First Mate', target: 14, progress: ((streak-7)/7)*100, rank: 2 }
  if (streak >= 1)  return { image: '/tiers/wayfinder.svg', name: 'Wayfinder',   description: "You're navigating the vast ocean. Don't lose direction.", next: 'Corsair', target: 7, progress: ((streak-1)/6)*100, rank: 1 }
  return { image: '/tiers/deckhand.svg', name: 'Deckhand', description: "You're just getting started. Earn your keep.", next: 'Wayfinder', target: 1, progress: 0, rank: 0 }
}

const getWeekDaysLocal = (currentStreak: number) => {
  const now = new Date()
  const localDay = now.getDay()
  const daysSinceThursday = (localDay + 7 - 4) % 7
  const thisWeekThursday = new Date(now)
  thisWeekThursday.setDate(now.getDate() - daysSinceThursday)
  thisWeekThursday.setHours(0, 0, 0, 0)
  const days = []
  const dayLabels = ['T', 'F', 'S', 'S', 'M', 'T', 'W']
  for (let i = 0; i < 7; i++) {
    const date = new Date(thisWeekThursday)
    date.setDate(thisWeekThursday.getDate() + i)
    const daysFromToday = daysSinceThursday - i
    const completed = daysFromToday >= 0 && daysFromToday < currentStreak
    days.push({ day: dayLabels[i], completed, isToday: i === daysSinceThursday })
  }
  return days
}

// ── Card inspect modal (diagonal spin reveal) ────────────────
function CardInspectModal({ card, onClose }: { card: PhotoCard; onClose: () => void }) {
  const [phase, setPhase] = useState<"spinning"|"settled">("spinning")
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPhase("settled"), 800)
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => { clearTimeout(t); window.removeEventListener("keydown", handler) }
  }, [onClose])

  const spinning = phase === "spinning"

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      {/* glow orb */}
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: `${card.color}20`, filter: "blur(60px)", pointerEvents: "none" }} />

      <div onClick={e => e.stopPropagation()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, zIndex: 1 }}>
        {/* card with spin animation */}
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            width: 260, aspectRatio: "2/3", borderRadius: 16, overflow: "hidden", position: "relative",
            maskImage: "radial-gradient(white, white)", WebkitMaskImage: "radial-gradient(white, white)",
            border: `2px solid ${card.color}`,
            boxShadow: `0 0 40px ${card.color}55, 0 20px 60px rgba(0,0,0,0.7)`,
            animation: spinning ? "cardSpinReveal 0.9s cubic-bezier(0.22,1,0.36,1) both" : "none",
            willChange: "transform, opacity",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
            transform: hovering && !spinning ? "translateZ(0) scale(1.02)" : "translateZ(0)",
            transition: spinning ? "none" : "transform 0.15s ease",
          }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${card.color},#fff8,${card.color})`, backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite", zIndex: 5 }} />
          {/* border overlay — sits above video to fix corner issue on mobile */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 16, boxShadow: `inset 0 0 0 2px ${card.color}`, pointerEvents: "none" }} />
          {card.imageUrl.endsWith(".mov") || card.imageUrl.endsWith(".mp4") ? (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 16 }}>
              <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}>
                <source src={card.imageUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <Image src={card.imageUrl} alt={card.memberName} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="260px" />
          )}
          {/* holo overlay */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg,rgba(255,0,128,.07),rgba(255,165,0,.07),rgba(255,255,0,.07),rgba(0,255,128,.07),rgba(0,128,255,.07),rgba(128,0,255,.07),rgba(255,0,128,.07))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", pointerEvents: "none", zIndex: 3 }} />
          {hovering && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,.15) 0%, transparent 55%)`, mixBlendMode: "screen", zIndex: 4, pointerEvents: "none" }} />}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)", zIndex: 6 }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 7 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 14, margin: 0, textShadow: `0 0 16px ${card.color}` }}>{card.memberName}</p>
          </div>
        </div>

        {/* card info — fades in after spin */}
        <div style={{
          textAlign: "center", opacity: spinning ? 0 : 1, transform: spinning ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.25s 0.3s, transform 0.25s 0.3s",
        }}>
          <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: "0 0 3px" }}>{card.memberName}</p>
          <p style={{ color: card.color, fontWeight: 600, fontSize: 12, margin: "0 0 2px" }}>{card.groupLabel} · {card.collectionName}</p>
          <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>#{card.cardNumber}</p>
        </div>

        <p style={{ color: "#484f58", fontSize: 10, margin: 0, opacity: spinning ? 0 : 1, transition: "opacity 0.2s 0.4s" }}>
          Tap anywhere or press Esc to close
        </p>
      </div>


    </div>
  )
}

// ── Mini photocard item ───────────────────────────────────────
function MiniCard({ card, owned, onInspect }: { card: PhotoCard; owned: boolean; onInspect: (card: PhotoCard) => void }) {
  const [err, setErr] = useState(false)
  const isVideo = owned && !err && (card.imageUrl.endsWith(".mp4") || card.imageUrl.endsWith(".webm"))

  return (
    <div style={{ flexShrink: 0, width: 120 }}>
      {/* Outer overflow:hidden — level 1 (same as HoloCard in gallery) */}
      <div
        style={{ borderRadius: 10, overflow: "hidden", position: "relative" }}
      >
        {/* Inner overflow:hidden — level 2 (same as inner card div in gallery) */}
        <div
          onClick={() => owned && onInspect(card)}
          style={{
            width: 120, aspectRatio: "2/3", borderRadius: 10, overflow: "hidden",
            border: owned ? `2px solid ${card.color}77` : "1.5px solid rgba(255,255,255,0.06)",
            background: owned ? `linear-gradient(160deg,${card.color}18,${card.color}06)` : "#0d1117",
            position: "relative",
            cursor: owned ? "pointer" : "default",
            boxShadow: owned ? `0 0 16px ${card.color}33, 0 4px 12px rgba(0,0,0,0.5)` : "none",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => { if (owned) { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.04)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px ${card.color}55, 0 8px 20px rgba(0,0,0,0.6)` } }}
          onMouseLeave={e => { if (owned) { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 16px ${card.color}33, 0 4px 12px rgba(0,0,0,0.5)` } }}
        >
          {/* Top shimmer bar */}
          {owned && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: card.color, borderRadius: "10px 10px 0 0", zIndex: 5 }} />}

          {/* Media */}
          {owned && !err ? (
            isVideo ? (
              <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}>
                <source src={card.imageUrl} type="video/mp4" />
              </video>
            ) : (
              <Image src={card.imageUrl} alt={card.memberName} fill style={{ objectFit: "cover", objectPosition: "top" }} onError={() => setErr(true)} sizes="120px" />
            )
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {owned
                ? <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${card.color}88`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>{card.memberId.toUpperCase()}</div>
                : <Lock size={14} style={{ color: "rgba(255,255,255,0.1)" }} />
              }
            </div>
          )}

          {/* Gradient + text */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(to top,rgba(0,0,0,0.95),transparent)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 5px 3px", zIndex: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: owned ? "white" : "rgba(255,255,255,0.15)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {owned ? card.memberName : "???"}
            </span>
            {owned && <span style={{ fontSize: 7, fontWeight: 600, color: `${card.color}cc`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
              {card.collectionName} #{card.cardNumber}
            </span>}
          </div>

          {/* Border overlay */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, boxShadow: owned ? `inset 0 0 0 2px ${card.color}77` : "inset 0 0 0 1.5px rgba(255,255,255,0.06)", pointerEvents: "none", zIndex: 7 }} />
        </div>
      </div>
    </div>
  )
}


function GalleryOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handler)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#060810", overflowY: "auto", scrollbarWidth: "none" }}>

      <PhotocardGallery onClose={onClose} />
    </div>
  )
}

// ── Main StreakModal ──────────────────────────────────────────
interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}


// ── Welcome card modal ────────────────────────────────────────
function WelcomeCardModal({ card, onClose }: { card: PhotoCard; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400)
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => { clearTimeout(t); window.removeEventListener("keydown", handler) }
  }, [onClose])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.95)", padding: 20 }}>
      {/* glow */}
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(249,115,22,0.15),transparent 70%)", pointerEvents: "none", animation: "pulse 2s ease infinite" }} />

      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", maxWidth: 320 }}>
        {/* title */}
        <div style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease" }}>
          <p style={{ color: "#f97316", fontWeight: 800, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>Welcome to ATINYTOWN</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.06em", color: "white", margin: 0, lineHeight: 1 }}>
            A Gift For You 🎁
          </h2>
          <p style={{ color: "#8b949e", fontSize: 13, margin: "8px 0 0" }}>
            You've received a one-of-a-kind legendary photocard — only given once, to every ATINY who joins ATINYTOWN.
          </p>
        </div>

        {/* card */}
        <div style={{
          width: 200, aspectRatio: "2/3", borderRadius: 20, overflow: "hidden", position: "relative",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          border: `2px solid ${card.color}`,
          boxShadow: `0 0 60px ${card.color}66, 0 20px 80px rgba(0,0,0,0.8)`,
          opacity: revealed ? 1 : 0,
          animation: revealed ? "cardSpinReveal 0.9s cubic-bezier(0.22,1,0.36,1) both" : "none",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${card.color},${card.secondColor},${card.color})`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          {/* holo */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg,rgba(255,0,128,.1),rgba(255,165,0,.1),rgba(255,255,0,.1),rgba(0,255,128,.1),rgba(0,128,255,.1),rgba(128,0,255,.1),rgba(255,0,128,.1))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", zIndex: 2, pointerEvents: "none" }} />
          {card.imageUrl.endsWith(".mp4") || card.imageUrl.endsWith(".webm") ? (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20 }}>
              <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}>
                <source src={card.imageUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <Image src={card.imageUrl} alt={card.memberName} fill unoptimized style={{ objectFit: "cover", objectPosition: "center" }} sizes="200px" />
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)", zIndex: 3 }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 4 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 14, margin: 0, textShadow: `0 0 20px ${card.color}` }}>{card.memberName}</p>
            <p style={{ color: `${card.color}cc`, fontSize: 10, margin: "2px 0 0" }}>Legendary · 1 of 1</p>
          </div>
          {/* legendary badge */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 5, background: "linear-gradient(135deg,#f97316,#fbbf24)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>LEGENDARY</div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg,#f97316,#fbbf24)",
            border: "none", borderRadius: 12, padding: "14px 32px",
            color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
            opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease 0.8s, transform 0.5s ease 0.8s",
          }}
        >
          Add to Collection →
        </button>
      </div>
    </div>
  )
}

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
  const { user } = useUser()
  const router = useRouter()
  const [stats, setStats]             = useState<UserStats | null>(null)
  const [badges, setBadges]           = useState<Badge[]>([])
  const [owned, setOwned]             = useState<Set<string>>(new Set())
  const [welcomeCard, setWelcomeCard] = useState<PhotoCard | null>(null)
  const [loading, setLoading]         = useState(true)
  const [inspecting, setInspecting] = useState<PhotoCard | null>(null)

  useEffect(() => {
    if (isOpen) { fetchStats(); fetchPhotocards(); checkWelcome() }
  }, [isOpen])

  const checkWelcome = async () => {
    try {
      const res = await fetch("/api/photocards/welcome", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        if (data.cardId) {
          const card = ALL_CARDS.find(c => c.id === data.cardId)
          if (card) {
            setOwned(prev => new Set([...prev, card.id]))
            setWelcomeCard(card)
          }
        }
      }
    } catch {}
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user-stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setBadges(data.badges)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchPhotocards = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/photocards/collection?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setOwned(new Set(data.cards || []))
      }
    } catch {}
  }

  if (!isOpen) return null

  const tier = stats ? getTierInfo(stats.currentStreak) : null
  const daysRemaining = tier?.next ? (tier.target! - (stats?.currentStreak || 0)) : 0
  const weekDays = getWeekDaysLocal(stats?.currentStreak || 0)
  const completedDays = weekDays.filter(d => d.completed).length
  const ownedCount = ALL_CARDS.filter(c => owned.has(c.id)).length

  // For preview row — only show owned cards
  const ownedCards = ALL_CARDS.filter(c => owned.has(c.id))

  return (
    <>
      <GlobalStyles />
      <div     style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={onClose}
      >
        <div
          style={{ position: "relative", width: "100%", maxWidth: 440 }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#0d1117", border: "1px solid rgba(139,92,246,0.4)", maxHeight: "min(88vh, 800px)", display: "flex", flexDirection: "column", boxShadow: "0 0 0 1px rgba(59,130,246,0.3), 0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(236,72,153,0.1)" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", animation: "pulse 2s ease-in-out infinite" }} />
                <span style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>ATINY Stats</span>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: "#484f58" }}>Loading...</div>
            ) : (
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1, scrollbarWidth: "none" }}>

                {/* Tier + streak */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", filter: "blur(16px)", opacity: 0.4 }} />
                    <div style={{ position: "relative", width: 80, height: 96 }}>
                      {tier?.image && <Image src={tier.image} alt={tier.name} fill style={{ objectFit: "contain" }} />}
                    </div>
                    <div style={{ position: "absolute", top: -4, right: -4, color: "#58a6ff", fontSize: 12, animation: "pulse 2s ease-in-out infinite" }}>✦</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ color: "white", fontWeight: 900, fontSize: 17 }}>{tier?.name}</span>
                      <span style={{ background: "rgba(88,166,255,0.15)", color: "#58a6ff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(88,166,255,0.25)" }}>RANK {tier?.rank}</span>
                    </div>
                    <p style={{ color: "#8b949e", fontSize: 11, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>{tier?.description}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                      <span style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{stats?.currentStreak || 0}</span>
                      <span style={{ color: "#8b949e", fontSize: 12 }}>day streak</span>
                    </div>
                    {tier?.next ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "#8b949e", fontSize: 10 }}>Progress to {tier.next}</span>
                          <span style={{ color: "#8b949e", fontSize: 10 }}>{Math.round(tier.progress)}%</span>
                        </div>
                        <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${tier.progress}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 3, transition: "width 0.5s" }} />
                        </div>
                        <p style={{ color: "#484f58", fontSize: 10, marginTop: 4 }}>{daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining</p>
                      </>
                    ) : (
                      <p style={{ color: "#22c55e", fontSize: 12 }}>Highest level reached!</p>
                    )}
                  </div>
                </div>

                {/* Stats bar */}
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
                    {[
                      { label: "Total Streams", value: stats?.totalStreams?.toLocaleString() || "0" },
                      { label: "Best Streak",   value: stats?.longestStreak || 0 },
                      { label: "Best Day",      value: stats?.highestDailyStreams || 0 },
                    ].map(({ label, value }, i, arr) => (
                      <div key={label} style={{ flex: 1, borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ color: "white", fontWeight: 800, fontSize: 20 }}>{value}</div>
                        <div style={{ color: "#484f58", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly streak */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weekly Streak</span>
                    <span style={{ color: "#58a6ff", fontSize: 10, fontWeight: 600 }}>{completedDays}/7 Complete</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {weekDays.map((day, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, position: "relative", background: day.completed ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.04)", border: day.isToday ? "1px solid rgba(88,166,255,0.4)" : "1px solid rgba(255,255,255,0.06)", color: day.completed ? "white" : "#484f58", boxShadow: day.completed ? "0 4px 12px rgba(34,197,94,0.2)" : "none" }}>
                          {day.completed ? "✓" : day.day}
                          {day.isToday && <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#58a6ff" }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: "#484f58", fontSize: 10, textAlign: "center", marginTop: 10 }}>Week resets every Thursday</p>
                </div>

                {/* Achievements */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Achievements</span>
                    <span style={{ color: "#484f58", fontSize: 10 }}>{badges.length} unlocked</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                    {badges.map(badge => (
                      <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ position: "relative", width: 64, height: 76 }}>
                          <Image src={badge.image} alt={badge.name} fill style={{ objectFit: "contain" }} />
                        </div>
                        <p style={{ color: "#8b949e", fontSize: 10, fontWeight: 600, marginTop: 6, textAlign: "center", maxWidth: 80 }}>{badge.name}</p>
                        <p style={{ color: "#484f58", fontSize: 9, marginTop: 2, textAlign: "center", maxWidth: 90 }}>{badge.description}</p>
                      </div>
                    ))}
                    {badges.length < 6 && Array.from({ length: Math.min(6 - badges.length, 3) }).map((_, i) => (
                      <div key={`locked-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.25 }}>
                        <div style={{ width: 64, height: 76, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock size={20} style={{ color: "#484f58" }} />
                        </div>
                        <p style={{ color: "#484f58", fontSize: 10, marginTop: 6 }}>Locked</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Photocard section ── */}
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px", overflow: "visible" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Photocards</span>
                      <span style={{ color: "#484f58", fontSize: 10, marginLeft: 8 }}>{ownedCount}/{ALL_CARDS.length}</span>
                    </div>
                    <button
                      onClick={() => { onClose(); router.push('/photocards') }}
                      style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 7, padding: "4px 10px", color: "#f97316", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.15)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)"}
                    >
                      View All <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* owned cards row or empty state */}
                  {ownedCards.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px 0 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 28 }}>📭</span>
                      <p style={{ color: "#484f58", fontSize: 12, margin: 0, fontWeight: 600 }}>No photocards yet!</p>
                      <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>Complete daily missions to earn your first card</p>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      {ownedCards.length > 3 && (
                        <button
                          onClick={() => {
                            const el = document.getElementById("photocard-scroll-row")
                            if (el) el.scrollBy({ left: -240, behavior: "smooth" })
                          }}
                          style={{ position: "absolute", left: -12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.12)", color: "#8b949e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                        >‹</button>
                      )}
                      <div
                        id="photocard-scroll-row"
                        style={{ display: "flex", flexDirection: "row", gap: 10, overflowX: "auto", overflowY: "visible", paddingBottom: 12, paddingTop: 8, msOverflowStyle: "none", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
                      >
                        {ownedCards.map(card => (
                          <MiniCard key={card.id} card={card} owned={true} onInspect={setInspecting} />
                        ))}
                      </div>
                      {ownedCards.length > 3 && (
                        <button
                          onClick={() => {
                            const el = document.getElementById("photocard-scroll-row")
                            if (el) el.scrollBy({ left: 240, behavior: "smooth" })
                          }}
                          style={{ position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 28, height: 28, borderRadius: "50%", background: "rgba(13,17,23,0.95)", border: "1px solid rgba(255,255,255,0.12)", color: "#8b949e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                        >›</button>
                      )}
                    </div>
                  )}
                </div>

                {/* Motivational footer */}
                <div style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                  <p style={{ color: "white", fontSize: 12, fontWeight: 600 }}>
                    {stats && stats.currentStreak > 0
                      ? `You're on fire! Don't break your ${stats.currentStreak}-day streak!`
                      : "Complete your first mission set to start your streak!"}
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card inspect modal */}
      {inspecting && <CardInspectModal card={inspecting} onClose={() => setInspecting(null)} />}
      {welcomeCard && <WelcomeCardModal card={welcomeCard} onClose={() => setWelcomeCard(null)} />}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </>
  )
}