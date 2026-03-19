"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

// PhotoCard type (minimal - just what WelcomeCardModal needs)
interface PhotoCard {
  id: string
  collectionId: string
  collectionName: string
  groupId: string
  groupLabel: string
  rarity: string
  pool: string
  memberId: string
  memberName: string
  cardNumber: number
  color: string
  secondColor: string
  imageUrl: string
}

// ── Welcome card modal ────────────────────────────────────────
export default function WelcomeCardModal({
  card,
  onClose,
  eyebrow = "Welcome to ATINYTOWN",
  title = "A Gift For You 🎁",
  subtitle = "{subtitle}",
  claimLabel = "Add to Collection →",
}: {
  card: PhotoCard
  onClose: () => void
  eyebrow?: string
  title?: string
  subtitle?: string
  claimLabel?: string
}) {
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
          <p style={{ color: "#f97316", fontWeight: 800, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>{eyebrow}</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.06em", color: "white", margin: 0, lineHeight: 1 }}>
            {title}
          </h2>
          <p style={{ color: "#8b949e", fontSize: 13, margin: "8px 0 0" }}>
            {subtitle}
          </p>
        </div>

        {/* card */}
        <div style={{
          width: 200, aspectRatio: "2/3", borderRadius: 20, position: "relative",
          border: `2px solid ${card.color}`,
          boxShadow: `0 0 60px ${card.color}66, 0 20px 80px rgba(0,0,0,0.8)`,
          opacity: revealed ? 1 : 0,
          animation: revealed ? "cardSpinReveal 0.9s cubic-bezier(0.22,1,0.36,1) both" : "none",
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}>
          {/* clip container — clips video to rounded corners */}
          {card.imageUrl.endsWith(".mov") || card.imageUrl.endsWith(".mp4") ? (
            <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", zIndex: 0, clipPath: "inset(0 round 18px)" }}>
              <source src={card.imageUrl} type="video/mp4" />
            </video>
          ) : (
            <Image src={card.imageUrl} alt={card.memberName} fill unoptimized style={{ objectFit: "cover", objectPosition: "center" }} sizes="200px" />
          )}
          {/* border overlay — above video on mobile */}
          <div style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 18, boxShadow: `inset 0 0 0 2px ${card.color}`, pointerEvents: "none" }} />
          {/* shimmer bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 3, background: `linear-gradient(90deg,${card.color},${card.secondColor ?? card.color},${card.color})`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite", display: card.imageUrl.endsWith(".mp4") || card.imageUrl.endsWith(".webm") ? "none" : "block" }} />
          {/* holo */}
          <div style={{ position: "absolute", inset: 0, zIndex: 3, background: "linear-gradient(125deg,rgba(255,0,128,.1),rgba(255,165,0,.1),rgba(255,255,0,.1),rgba(0,255,128,.1),rgba(0,128,255,.1),rgba(128,0,255,.1),rgba(255,0,128,.1))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, zIndex: 4, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)" }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 5 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 14, margin: 0, textShadow: `0 0 20px ${card.color}` }}>{card.memberName}</p>
            <p style={{ color: `${card.color}cc`, fontSize: 10, margin: "2px 0 0" }}>Legendary · 1 of 1</p>
          </div>
          {/* legendary badge */}
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 6, background: "linear-gradient(135deg,#f97316,#fbbf24)", borderRadius: 6, padding: "2px 8px", fontSize: 9, fontWeight: 900, color: "white", letterSpacing: "0.05em" }}>LEGENDARY</div>
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