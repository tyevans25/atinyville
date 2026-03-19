"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { ChevronLeft, Lock } from "lucide-react"

// ── Photocard catalog ────────────────────────────────────────
// To add a new collection: add an entry to COLLECTIONS, upload images to
// Cloudinary under the specified folder path. No version ID needed.
// ID format: {collectionId}-{memberId}-{num}  e.g. "ghp4-concept-hj-1"

const CLOUD = "dbz7nif6b"

type Rarity = "common" | "rare" | "legendary"
type Pool   = "general" | "album" | "both" | "event"

interface Collection {
  id: string            // e.g. "ghp4-concept" — internal code ID
  name: string          // e.g. "Concept Photos" — display name
  groupLabel: string    // e.g. "GOLDEN HOUR Pt.4" — gallery section header
  groupId: string       // e.g. "ghp4" — for grouping collections in gallery
  rarity: Rarity
  pool: Pool            // which mission pool this drops from
  folder: string        // actual Cloudinary folder path
  cardCounts: Record<string, number>
  ext?: string   // file extension, defaults to "jpg" — use "gif" for animated cards
}

const COLLECTIONS: Collection[] = [
  {
    id: "ghp4-concept",
    name: "Concept Photos",
    groupLabel: "GOLDEN HOUR Pt.4",
    groupId: "ghp4",
    rarity: "common",
    pool: "general",
    folder: "photocards/golden-hour-pt4",
    cardCounts: { hj: 4, sh: 4, yh: 4, ys: 4, sn: 4, mg: 4, wy: 4, jh: 4 },
  },
  {
    id: "ghp4-apple",
    name: "Apple Music Exclusive",
    groupLabel: "GOLDEN HOUR Pt.4",
    groupId: "ghp4",
    rarity: "rare",
    pool: "general",
    folder: "photocards/ghp4-apple-music",
    cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  },
  {
    id: "welcome-ot8",
    name: "Welcome to ATINYville",
    groupLabel: "Special",
    groupId: "special",
    rarity: "legendary",
    pool: "event",
    folder: "photocards/welcome-ot8",
    ext: "mp4",
    cardCounts: { ot8: 1 },
  },
  // ── Add future collections here ↓ ──────────────────────────
  { id: "bday-hj", name: "Hongjoong's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/hj", cardCounts: { hj: 10 }, ext: "mp4" },
  { id: "bday-sh", name: "Seonghwa's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/sh", cardCounts: { sh: 10 }, ext: "mp4" },
  { id: "bday-yh", name: "Yunho's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/yh", cardCounts: { yh: 10 }, ext: "mp4" },
  { id: "bday-ys", name: "Yeosang's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/ys", cardCounts: { ys: 10 }, ext: "mp4" },
  { id: "bday-sn", name: "San's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/sn", cardCounts: { sn: 10 }, ext: "mp4" },
  { id: "bday-mg", name: "Mingi's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/mg", cardCounts: { mg: 10 }, ext: "mp4" },
  { id: "bday-wy", name: "Wooyoung's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/wy", cardCounts: { wy: 10 }, ext: "mp4" },
  ...(process.env.NODE_ENV === "development" ? [{ id: "bday-test", name: "Test Member's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as const, pool: "event" as const, folder: "photocards/birthdays/test", cardCounts: { test: 10 }, ext: "mp4" }] : []),
  { id: "bday-jh", name: "Jongho's Birthday", groupLabel: "Birthdays", groupId: "birthdays", rarity: "legendary" as Rarity, pool: "event" as Pool, folder: "photocards/birthdays/jh", cardCounts: { jh: 10 }, ext: "mp4" },
  // {
  //   id: "ghp4-target",
  //   name: "Target Exclusive",
  //   groupLabel: "GOLDEN HOUR Pt.4",
  //   groupId: "ghp4",
  //   rarity: "rare",
  //   pool: "general",
  //   folder: "photocards/ghp4-target",
  //   versionId: "vXXXXXXXXXX",
  //   cardCounts: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 },
  // },
  // {
  //   id: "bday-hj-2025",
  //   name: "Hongjoong Birthday 2025",
  //   groupLabel: "Special",
  //   groupId: "special",
  //   rarity: "legendary",
  //   pool: "event",
  //   folder: "photocards/bday-hj-2025",
  //   versionId: "vXXXXXXXXXX",
  //   cardCounts: { hj: 1 },
  // },
]

// Drop weights for awardRandomCard()
const RARITY_WEIGHTS: Record<Rarity, number> = {
  common:    70,
  rare:      25,
  legendary:  5,
}

const MEMBER_META: Record<string, { name: string; color: string; secondColor: string }> = {
  hj: { name: "Hongjoong", color: "#FF6B35", secondColor: "#FF9A6C" },
  sh: { name: "Seonghwa",  color: "#B48EE0", secondColor: "#D8B4FE" },
  yh: { name: "Yunho",     color: "#4FC3F7", secondColor: "#BAE6FD" },
  ys: { name: "Yeosang",   color: "#81C784", secondColor: "#BBF7D0" },
  sn: { name: "San",       color: "#F06292", secondColor: "#FBCFE8" },
  mg: { name: "Mingi",     color: "#FFD54F", secondColor: "#FEF08A" },
  wy: { name: "Wooyoung",  color: "#CE93D8", secondColor: "#E9D5FF" },
  jh: { name: "Jongho",    color: "#4DD0E1", secondColor: "#A5F3FC" },
  ot8: { name: "ATEEZ",     color: "#f97316", secondColor: "#fbbf24" },
  test: { name: "Test Member", color: "#f97316", secondColor: "#fbbf24" },
}

interface PhotoCard {
  id: string            // "ghp4-concept-hj-1" — unique trade-safe ID
  collectionId: string  // "ghp4-concept"
  collectionName: string// "Concept Photos"
  groupId: string       // "ghp4"
  groupLabel: string    // "GOLDEN HOUR Pt.4"
  rarity: Rarity
  pool: Pool
  memberId: string
  memberName: string
  cardNumber: number
  color: string
  secondColor: string
  imageUrl: string
}

function buildCatalog(): PhotoCard[] {
  const cards: PhotoCard[] = []
  for (const col of COLLECTIONS) {
    for (const [memberId, count] of Object.entries(col.cardCounts)) {
      const meta = MEMBER_META[memberId]
      for (let i = 1; i <= count; i++) {
        cards.push({
          id: `${col.id}-${memberId}-${i}`,
          collectionId: col.id,
          collectionName: col.name,
          groupId: col.groupId,
          groupLabel: col.groupLabel,
          rarity: col.rarity,
          pool: col.pool,
          memberId,
          memberName: meta.name,
          cardNumber: i,
          color: meta.color,
          secondColor: meta.secondColor,
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

// ── Award helpers ─────────────────────────────────────────────
// Returns a random card weighted by rarity from the general pool
// Pass owned set to avoid dupes within same collection (allows dupes across for trading)
function pickWeightedCard(owned: Set<string>): PhotoCard | null {
  const generalPool = COLLECTIONS.filter(c => c.pool === "general" || c.pool === "both")
  if (generalPool.length === 0) return null

  // Build weighted list of eligible cards
  const weighted: Array<{ card: PhotoCard; weight: number }> = []
  for (const col of generalPool) {
    const weight = RARITY_WEIGHTS[col.rarity]
    const colCards = ALL_CARDS.filter(c => c.collectionId === col.id)
    for (const card of colCards) {
      weighted.push({ card, weight })
    }
  }

  // Filter to unowned only (no dupes within same collection)
  const eligible = weighted.filter(({ card }) => !owned.has(card.id))
  if (eligible.length === 0) return null

  const totalWeight = eligible.reduce((sum, { weight }) => sum + weight, 0)
  let rand = Math.random() * totalWeight
  for (const { card, weight } of eligible) {
    rand -= weight
    if (rand <= 0) return card
  }
  return eligible[eligible.length - 1].card
}

// ── Holo effect ───────────────────────────────────────────────
function HoloCard({ color, owned, children }: { color: string; owned: boolean; children: React.ReactNode }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      onMouseEnter={() => owned && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}
    >
      {owned && <>
        <div style={{
          position: "absolute", inset: 0, zIndex: 10, borderRadius: 16, pointerEvents: "none",
          background: "linear-gradient(125deg,rgba(255,0,128,.07),rgba(255,165,0,.07),rgba(255,255,0,.07),rgba(0,255,128,.07),rgba(0,128,255,.07),rgba(128,0,255,.07),rgba(255,0,128,.07))",
          backgroundSize: "400% 400%", animation: "holoShimmer 4s linear infinite", mixBlendMode: "screen",
        }} />
        {hovering && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 11, borderRadius: 16, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,.15) 0%, transparent 55%)",
            mixBlendMode: "screen",
          }} />
        )}
      </>}
      {children}
    </div>
  )
}

// ── Single card ───────────────────────────────────────────────
function PhotoCardItem({ card, owned, isNew, onClick }: {
  card: PhotoCard
  owned: boolean
  isNew: boolean
  onClick: () => void
}) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div
      onClick={onClick}
      style={{
        cursor: owned ? "pointer" : "default",
        position: "relative",
        animation: isNew ? "cardPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
      }}
    >
      {isNew && (
        <div style={{
          position: "absolute", top: -8, right: -8, zIndex: 20,
          background: "linear-gradient(135deg,#f97316,#fbbf24)",
          borderRadius: 99, padding: "2px 8px",
          fontSize: 9, fontWeight: 900, color: "white",
          boxShadow: "0 0 12px rgba(249,115,22,0.6)",
        }}>NEW</div>
      )}
      <HoloCard color={card.color} owned={owned}>
        <div style={{
          width: "100%",
          aspectRatio: "2/3",
          borderRadius: 16,
          overflow: "hidden",
          border: owned
            ? `2px solid ${card.color}88`
            : "2px solid rgba(255,255,255,0.06)",
          background: owned
            ? `linear-gradient(160deg,${card.color}18,${card.color}06)`
            : "#0d1117",
          position: "relative",
          boxShadow: owned
            ? `0 0 20px ${card.color}33, 0 8px 32px rgba(0,0,0,0.5)`
            : "0 4px 16px rgba(0,0,0,0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={e => owned && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.02)")}
          onMouseLeave={e => owned && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0) scale(1)")}
        >
          {/* shimmer bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 5,
            background: owned
              ? `linear-gradient(90deg,${card.color},${card.secondColor},${card.color})`
              : "rgba(255,255,255,0.04)",
            backgroundSize: "200% 100%",
            animation: owned ? "shimmer 3s linear infinite" : "none",
          }} />

          {/* image or locked */}
          {owned && !imgErr ? (
            card.imageUrl.endsWith(".mov") || card.imageUrl.endsWith(".mp4") ? (
                <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}>
                  <source src={card.imageUrl} type={card.imageUrl.endsWith(".mov") ? "video/mp4" : "video/mp4"} />
                </video>
              ) : card.imageUrl.endsWith(".gif") ? (
              <img src={card.imageUrl} alt={`${card.memberName} ${card.collectionName} #${card.cardNumber}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} onError={() => setImgErr(true)} />
            ) : (
              <Image src={card.imageUrl} alt={`${card.memberName} ${card.collectionName} #${card.cardNumber}`} fill style={{ objectFit: "cover", objectPosition: "top" }} onError={() => setImgErr(true)} sizes="200px" />
            )
          ) : owned && imgErr ? (
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%,${card.color},${card.color}88)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 900, color: "white",
              }}>{card.memberId.toUpperCase()}</div>
            </div>
          ) : (
            // Locked — silhouette
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 8,
              background: "linear-gradient(160deg,#0d1117,#111827)",
            }}>
              <Lock size={24} style={{ color: "rgba(255,255,255,0.1)" }} />
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }} />
            </div>
          )}

          {/* gradient overlay at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
            zIndex: 2,
          }} />

          {/* card label */}
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", zIndex: 3, padding: "0 6px" }}>
            {owned ? (
              <>
                <p style={{ color: "white", fontWeight: 800, fontSize: 11, margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{card.memberName}</p>
                <p style={{ color: `${card.color}cc`, fontSize: 9, margin: "1px 0 0", fontWeight: 600 }}>{card.collectionName} · #{card.cardNumber}</p>
              </>
            ) : (
              <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, margin: 0 }}>???</p>
            )}
          </div>
        </div>
      </HoloCard>
    </div>
  )
}

// ── Card detail modal ─────────────────────────────────────────
function CardModal({ card, onClose }: { card: PhotoCard; onClose: () => void }) {
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
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.92)", padding: 20 }}
      onClick={onClose}
    >
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: `${card.color}18`, filter: "blur(80px)", pointerEvents: "none" }} />
      <div onClick={e => e.stopPropagation()} style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div
          onMouseEnter={() => !spinning && setHovering(true)}
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
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 5, background: `linear-gradient(90deg,${card.color},#fff8,${card.color})`, backgroundSize: "200% 100%", animation: "shimmer 2s linear infinite" }} />
          {/* border overlay — sits above video to fix corner issue on mobile */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 16, boxShadow: `inset 0 0 0 2px ${card.color}`, pointerEvents: "none" }} />
          {card.imageUrl.endsWith(".mp4") || card.imageUrl.endsWith(".webm") ? (
            <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", zIndex: 0, clipPath: "inset(0 round 14px)" }}>
              <source src={card.imageUrl} type="video/mp4" />
            </video>
          ) : (
            <Image src={card.imageUrl} alt={card.memberName} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="260px" />
          )}
          <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "linear-gradient(125deg,rgba(255,0,128,.07),rgba(255,165,0,.07),rgba(255,255,0,.07),rgba(0,255,128,.07),rgba(0,128,255,.07),rgba(128,0,255,.07),rgba(255,0,128,.07))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", pointerEvents: "none" }} />
          {hovering && <div style={{ position: "absolute", inset: 0, zIndex: 4, background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,.15) 0%, transparent 55%)", mixBlendMode: "screen", pointerEvents: "none" }} />}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, zIndex: 6, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)" }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 7 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 14, margin: 0, textShadow: `0 0 16px ${card.color}` }}>{card.memberName}</p>
          </div>
        </div>

        <div style={{ textAlign: "center", opacity: spinning ? 0 : 1, transform: spinning ? "translateY(8px)" : "translateY(0)", transition: "opacity 0.25s 0.3s, transform 0.25s 0.3s" }}>
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


// ── Earn reward modal ─────────────────────────────────────────
function EarnedModal({ card, onClose }: { card: PhotoCard; onClose: () => void }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => { setTimeout(() => setRevealed(true), 600) }, [])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.92)" }}>
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: `${card.color}22`, filter: "blur(100px)", pointerEvents: "none", animation: "pulse 2s ease infinite" }} />
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, letterSpacing: "0.2em", color: card.color, animation: "fadeUp 0.4s ease both" }}>
          MISSIONS COMPLETE
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.08em", color: "white", animation: "fadeUp 0.4s ease 0.1s both" }}>
          YOU EARNED A PHOTOCARD!
        </div>

        <div style={{
          width: 220, aspectRatio: "2/3", borderRadius: 20, overflow: "hidden",
          border: `2px solid ${card.color}`,
          boxShadow: `0 0 60px ${card.color}55, 0 20px 80px rgba(0,0,0,0.8)`,
          animation: revealed ? "cardSpinReveal 0.9s cubic-bezier(0.22,1,0.36,1) both" : "none",
          opacity: revealed ? 1 : 0,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
          position: "relative",
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${card.color},${card.secondColor},${card.color})`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          {/* border overlay — above video on mobile */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 20, boxShadow: `inset 0 0 0 2px ${card.color}`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg,rgba(255,0,128,.08),rgba(255,165,0,.08),rgba(255,255,0,.08),rgba(0,255,128,.08),rgba(0,128,255,.08),rgba(128,0,255,.08),rgba(255,0,128,.08))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", zIndex: 2 }} />
          {card.imageUrl.endsWith(".mp4") || card.imageUrl.endsWith(".webm") ? (
            <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", zIndex: 0, clipPath: "inset(0 round 18px)" }}>
              <source src={card.imageUrl} type="video/mp4" />
            </video>
          ) : (
            <Image src={card.imageUrl} alt={card.memberName} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="220px" />
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)", zIndex: 3 }} />
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", zIndex: 4 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 16, margin: 0, textShadow: `0 0 20px ${card.color}` }}>{card.memberName}</p>
            <p style={{ color: `${card.color}cc`, fontSize: 11, margin: "2px 0 0" }}>{card.groupLabel} · {card.collectionName} · #{card.cardNumber}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: `linear-gradient(135deg,${card.color},${card.secondColor})`,
            border: "none", borderRadius: 12, padding: "14px 32px",
            color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
            fontFamily: "inherit", boxShadow: `0 4px 20px ${card.color}44`,
            animation: "fadeUp 0.4s ease 0.8s both",
          }}
        >
          Add to Collection →
        </button>
      </div>
    </div>
  )
}

// ── Main gallery ──────────────────────────────────────────────
export default function PhotocardGallery({ onClose }: { onClose?: () => void } = {}) {
  const { isSignedIn, user, isLoaded } = useUser()
  const [owned, setOwned] = useState<Set<string>>(new Set())
  const [newCards, setNewCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<PhotoCard | null>(null)
  const [earnedCard, setEarnedCard] = useState<PhotoCard | null>(null)
  const [filterMember, setFilterMember] = useState<string>("all")

  useEffect(() => {
    if (!isLoaded) return
    fetchCollection()
  }, [isLoaded, isSignedIn, user])

  async function fetchCollection() {
    setLoading(true)
    try {
      if (isSignedIn && user) {
        const res = await fetch(`/api/photocards/collection?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setOwned(new Set(data.cards || []))
        }
      } else {
        // Guest — load from localStorage
        try {
          const local = JSON.parse(localStorage.getItem("atinytown_photocards") || "[]")
          setOwned(new Set(local))
        } catch {}
      }
    } catch {}
    setLoading(false)
  }

  // Called from daily missions when all complete
  async function awardRandomCard() {
    const card = pickWeightedCard(owned)
    if (!card) return

    const newOwned = new Set(owned)
    newOwned.add(card.id)
    setOwned(newOwned)
    setNewCards(prev => new Set([...prev, card.id]))
    setEarnedCard(card)

    // Persist
    if (isSignedIn && user) {
      await fetch("/api/photocards/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, cardId: card.id }),
      })
    } else {
      localStorage.setItem("atinytown_photocards", JSON.stringify([...newOwned]))
    }
  }

  const filtered = ALL_CARDS.filter(c => filterMember === "all" || c.memberId === filterMember)
  const ownedCount = ALL_CARDS.filter(c => owned.has(c.id)).length

  if (!isLoaded || loading) return (
    <div style={{ minHeight: "100vh", background: "#060810", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "3px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes holoShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#060810", fontFamily: "'DM Sans', sans-serif", color: "#e6edf3" }}>
        {/* bg */}
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(249,115,22,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.02) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px", position: "relative" }}>

          {/* Header */}
          <div style={{ padding: "24px 0 28px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 28 }}>
            <div style={{ marginBottom: 16 }}>
              {onClose ? (
                <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#8b949e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  <ChevronLeft size={14} /> Back
                </button>
              ) : (
                <Link href="/" style={{ textDecoration: "none" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#8b949e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    <ChevronLeft size={14} /> Back
                  </button>
                </Link>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px,5vw,44px)", letterSpacing: "0.06em", margin: 0, lineHeight: 1, color: "white" }}>
                  PHOTOCARD <span style={{ color: "#f97316" }}>COLLECTION</span>
                </h1>
                <p style={{ color: "#484f58", fontSize: 13, margin: "6px 0 0" }}>
                  {ownedCount}/{ALL_CARDS.length} collected
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#484f58" }}>Collection progress</span>
                  <span style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>{Math.round((ownedCount / ALL_CARDS.length) * 100)}%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(ownedCount / ALL_CARDS.length) * 100}%`, background: "linear-gradient(90deg,#f97316,#fbbf24)", borderRadius: 99, transition: "width 0.8s ease" }} />
                </div>
              </div>
            </div>

            {!isSignedIn && isLoaded && (
              <div style={{ marginTop: 12, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#8b949e" }}>
                <Link href="/" style={{ color: "#f97316" }}>Sign in</Link> to save your collection across devices. Complete daily missions to earn cards!
              </div>
            )}
          </div>

          {/* Member filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <button
              onClick={() => setFilterMember("all")}
              style={{ background: filterMember === "all" ? "#f97316" : "rgba(255,255,255,0.04)", border: `1px solid ${filterMember === "all" ? "#f97316" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 14px", color: filterMember === "all" ? "white" : "#8b949e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            >All</button>
            {Object.entries(MEMBER_META).map(([id, meta]) => {
              const memberOwned = ALL_CARDS.filter(c => c.memberId === id && owned.has(c.id)).length
              const memberTotal = ALL_CARDS.filter(c => c.memberId === id).length
              const active = filterMember === id
              return (
                <button
                  key={id}
                  onClick={() => setFilterMember(id)}
                  style={{
                    background: active ? `${meta.color}22` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? meta.color + "66" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 8, padding: "6px 14px",
                    color: active ? meta.color : "#484f58",
                    fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {meta.name}
                  <span style={{ fontSize: 10, opacity: 0.7 }}>{memberOwned}/{memberTotal}</span>
                </button>
              )
            })}
          </div>

          {/* Gallery — grouped by groupId, then collection within ──── */}
          {(() => {
            const groups = [...new Set(COLLECTIONS.map(c => c.groupId))]
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {groups.map(groupId => {
                  const groupCollections = COLLECTIONS.filter(c => c.groupId === groupId)
                  const groupLabel = groupCollections[0].groupLabel
                  return (
                    <div key={groupId}>
                      {/* Group header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                        <div style={{ height: 1, flex: 1, background: "rgba(249,115,22,0.2)" }} />
                        <span style={{ color: "#f97316", fontWeight: 900, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>{groupLabel}</span>
                        <div style={{ height: 1, flex: 1, background: "rgba(249,115,22,0.2)" }} />
                      </div>

                      {/* Collections within group */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {groupCollections.map(col => {
                          const colCards = ALL_CARDS.filter(c =>
                            c.collectionId === col.id &&
                            (filterMember === "all" || c.memberId === filterMember)
                          )
                          const colOwned = ALL_CARDS.filter(c => c.collectionId === col.id && owned.has(c.id)).length
                          const colTotal = ALL_CARDS.filter(c => c.collectionId === col.id).length
                          const rarityColor = col.rarity === "legendary" ? "#a78bfa" : col.rarity === "rare" ? "#38bdf8" : "#8b949e"
                          return (
                            <div key={col.id}>
                              {/* Collection header */}
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                <span style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{col.name}</span>
                                <span style={{ background: `${rarityColor}15`, border: `1px solid ${rarityColor}40`, borderRadius: 5, padding: "1px 7px", color: rarityColor, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.rarity}</span>
                                <span style={{ color: "#484f58", fontSize: 11, marginLeft: "auto" }}>{colOwned}/{colTotal}</span>
                              </div>
                              {/* Cards */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
                                {colCards.map(card => (
                                  <PhotoCardItem
                                    key={card.id}
                                    card={card}
                                    owned={owned.has(card.id)}
                                    isNew={newCards.has(card.id)}
                                    onClick={() => owned.has(card.id) && setSelectedCard(card)}
                                  />
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Dev test button — remove before launch */}
          {process.env.NODE_ENV === "development" && (
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <button
                onClick={awardRandomCard}
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 10, padding: "10px 20px", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                [DEV] Award Random Card
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
      {earnedCard && <EarnedModal card={earnedCard} onClose={() => { setEarnedCard(null); setNewCards(new Set()) }} />}
    </>
  )
}