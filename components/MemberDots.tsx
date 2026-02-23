"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"

const MEMBERS = [
  { name: "Hongjoong", initials: "HJ", color: "#FF6B35", secondColor: "#FF9A6C", role: "Captain · Rapper · Producer · Vocalist", type: "LEADER",    birthdate: "Nov 7, 1998",  height: "172 cm", mbti: "INFP", zodiac: "Scorpio", age: 27, image: "/members/hongjoong.jpg", fact: "If you see a squirrel that looks just like him... run.",                    rarity: "LEGENDARY" as const, power: 1024, stage: 95, vocal: 82, dance: 90 },
  { name: "Seonghwa",  initials: "SH", color: "#B48EE0", secondColor: "#D8B4FE", role: "Visual · Vocalist · Rapper ",           type: "VOCALIST",   birthdate: "Apr 3, 1998",  height: "178 cm", mbti: "ENFJ", zodiac: "Aries", age: 27, image: "/members/seonghwa.jpg",  fact: "Prone to small bouts of (harmless) violence.",                                rarity: "LEGENDARY" as const, power: 1024, stage: 95, vocal: 92, dance: 92 },
  { name: "Yunho",     initials: "YH", color: "#4FC3F7", secondColor: "#BAE6FD", role: "Main Dancer · Vocalist",      type: "DANCER",   birthdate: "Mar 23, 1999", height: "186 cm", mbti: "ENFJ", zodiac: "Aries", age: 26, image: "/members/yunho.jpg",     fact: "Gets away with anything becasue he's handsome and cute.",                   rarity: "LEGENDARY" as const, power: 1024, stage: 93, vocal: 90, dance: 96 },
  { name: "Yeosang",   initials: "YS", color: "#81C784", secondColor: "#BBF7D0", role: "Vocalist · Dancer · Visual",           type: "VOCALIST", birthdate: "Jun 15, 1999", height: "175 cm", mbti: "ISFJ", zodiac: "Gemini", age: 26, image: "/members/yeosang.jpg",   fact: "Superpower:hehet. Allegedly a doberman, occasionally resembles a maltese.", rarity: "LEGENDARY" as const, power: 1024, stage: 90, vocal: 90, dance: 90 },
  { name: "San",       initials: "SN", color: "#F06292", secondColor: "#FBCFE8", role: "Main Dancer · Vocalist",      type: "VOCALIST",birthdate: "Jul 10, 1999", height: "178 cm", mbti: "INFP", zodiac: "Cancer", age: 26, image: "/members/san.jpg",       fact: "WILL break the stage (metaphorically).. and 10 headsets (literally)",       rarity: "LEGENDARY" as const, power: 1024, stage: 99, vocal: 94, dance: 97 },
  { name: "Mingi",     initials: "MG", color: "#FFD54F", secondColor: "#FEF08A", role: "Rapper · Dancer",        type: "RAPPER",   birthdate: "Aug 9, 1999",  height: "184 cm", mbti: "ENTP", zodiac: "Leo", age: 26, image: "/members/mingi.jpg",     fact: "CAUTION: Will mesmerise you with his hips and disarm you with cuteness.",   rarity: "LEGENDARY" as const, power: 1024, stage: 91, vocal: 84, dance: 90 },
  { name: "Wooyoung",  initials: "WY", color: "#CE93D8", secondColor: "#E9D5FF", role: "Vocalist · Dancer",           type: "DANCER", birthdate: "Nov 26, 1999", height: "173 cm", mbti: "ISTJ", zodiac: "Sagittarius", age: 26, image: "/members/wooyoung.jpg",  fact: "He may bite. May also hiss. With the occasional purr.",                     rarity: "LEGENDARY" as const, power: 1024, stage: 92, vocal: 90, dance: 91 },
  { name: "Jongho",    initials: "JH", color: "#4DD0E1", secondColor: "#A5F3FC", role: "Main Vocalist",               type: "VOCALIST", birthdate: "Oct 12, 2000", height: "176 cm", mbti: "ISFP", age: 25, zodiac: "Libra", image: "/members/jongho.jpg",    fact: "Will seranade you beautifully to distract you from the fact that he's selling you out for 10 dollars.", rarity: "LEGENDARY" as const, power: 1024, stage: 90, vocal: 99, dance: 90 },
]
type Member = typeof MEMBERS[number]

const RARITY = {
  LEGENDARY: { label: "★ LEGENDARY", border: "#FFD700", glow: "rgba(255,215,0,0.5)",   text: "#FFD700", shimmer: ["#FFD700","#FFA500","#FF6B35","#FFD700"] },
  EPIC:      { label: "◆ EPIC",      border: "#C084FC", glow: "rgba(192,132,252,0.5)", text: "#C084FC", shimmer: ["#C084FC","#818CF8","#60A5FA","#C084FC"] },
  RARE:      { label: "● RARE",      border: "#60A5FA", glow: "rgba(96,165,250,0.4)",  text: "#60A5FA", shimmer: ["#60A5FA","#34D399","#60A5FA"] },
}

function StatDots({ value, color }: { value: number; color: string }) {
  const filled = Math.round((value / 100) * 5)
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < filled ? color : "rgba(255,255,255,0.1)", boxShadow: i < filled ? `0 0 5px ${color}` : "none" }} />
      ))}
    </div>
  )
}

function HoloCard({ member, isBias, children }: { member: Member; isBias: boolean; children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const [hovering, setHovering] = useState(false)
  return (
    <div
      onMouseMove={isBias ? e => { const r = e.currentTarget.getBoundingClientRect(); setPos({ x: ((e.clientX-r.left)/r.width)*100, y: ((e.clientY-r.top)/r.height)*100 }) } : undefined}
      onMouseEnter={() => isBias && setHovering(true)}
      onMouseLeave={() => { setHovering(false); setPos({ x: 50, y: 50 }) }}
      style={{ position: "relative", borderRadius: 20, overflow: "hidden" }}
    >
      {isBias && <>
        <div style={{ position: "absolute", inset: 0, zIndex: 10, borderRadius: 20, pointerEvents: "none", background: "linear-gradient(125deg,rgba(255,0,128,.07),rgba(255,165,0,.07),rgba(255,255,0,.07),rgba(0,255,128,.07),rgba(0,128,255,.07),rgba(128,0,255,.07),rgba(255,0,128,.07))", backgroundSize: "400% 400%", animation: "holoShimmer 4s linear infinite", mixBlendMode: "screen" }} />
        {hovering && <div style={{ position: "absolute", inset: 0, zIndex: 11, borderRadius: 20, pointerEvents: "none", background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,.18) 0%, transparent 55%)`, mixBlendMode: "screen" }} />}
      </>}
      {children}
    </div>
  )
}

function CardFront({ member, isBias, matchHeight }: { member: Member; isBias: boolean; matchHeight?: number }) {
  const rarity = RARITY[member.rarity]
  const idx = MEMBERS.findIndex(m => m.name === member.name)
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ width: 280, borderRadius: 20, overflow: "hidden", background: "linear-gradient(160deg,#111827,#0d1117)", border: `2px solid ${isBias ? rarity.border : rarity.border+"88"}`, boxShadow: isBias ? `0 0 0 2px ${rarity.border},0 0 30px ${rarity.glow},0 0 60px ${member.color}22,0 24px 60px rgba(0,0,0,.7)` : `0 0 20px ${rarity.glow},0 24px 60px rgba(0,0,0,.7)` }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${rarity.shimmer.join(",")})`, backgroundSize: "300% 100%", animation: isBias ? "shimmer 3s linear infinite" : "none" }} />
      <div style={{ padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ marginBottom: 3 }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 17 }}>{member.name}</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: `${member.color}22`, color: member.color, border: `1px solid ${member.color}44` }}>{member.type}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: `${rarity.border}15`, color: rarity.text, border: `1px solid ${rarity.border}44` }}>{rarity.label}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#484f58", fontSize: 9 }}>PWR </span>
            <span style={{ color: rarity.text, fontWeight: 900, fontSize: 22 }}>{member.power}</span>
          </div>
        </div>

        <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", border: `2px solid ${isBias ? rarity.border : member.color+"44"}`, aspectRatio: "3/4", marginBottom: 10, background: `linear-gradient(160deg,${member.color}18,${member.color}06)` }}>
          {!imgError
            ? <Image src={member.image} alt={member.name} fill style={{ objectFit: "cover", objectPosition: "top" }} onError={() => setImgError(true)} sizes="280px" />
            : <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%,${member.color},${member.color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "white", boxShadow: `0 0 30px ${member.color}55` }}>{member.initials}</div>
                <span style={{ color: `${member.color}66`, fontSize: 9 }}>Add /public/members/{member.name.toLowerCase()}.jpg</span>
              </div>
          }
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 50, background: "linear-gradient(to top,rgba(13,17,23,.95),transparent)" }} />
          <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.7)", borderRadius: 6, padding: "3px 8px", color: "white", fontSize: 10, fontWeight: 700 }}>{member.role}</div>
        </div>

        <div style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "8px 12px", marginBottom: 8, border: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
            {[{l:"STAGE",v:member.stage},{l:"VOCAL",v:member.vocal},{l:"DANCE",v:member.dance},{l:"POWER",v:member.power}].map(({l,v}) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#484f58", fontSize: 9, fontWeight: 700 }}>{l}</span>
                <StatDots value={v} color={member.color} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 8 }}>
          {[{l:"HEIGHT",v:member.height},{l:"MBTI",v:member.mbti}, {l:"ZODIAC",v:member.zodiac},{l:"AGE",v:member.age}].map(({l,v}) => (
            <div key={l} style={{ background: "rgba(255,255,255,.03)", borderRadius: 7, padding: "5px 6px", border: "1px solid rgba(255,255,255,.05)", textAlign: "center" }}>
              <p style={{ color: "#484f58", fontSize: 8, fontWeight: 700, textTransform: "uppercase", margin: "0 0 1px" }}>{l}</p>
              <p style={{ color: "#e6edf3", fontSize: 10, fontWeight: 700, margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ background: `${member.color}0d`, borderRadius: 8, padding: "8px 10px", border: `1px solid ${member.color}22`, marginBottom: 8 }}>
          <p style={{ color: "#484f58", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 3px" }}>Did you know?</p>
          <p style={{ color: "#8b949e", fontSize: 10, lineHeight: 1.5, margin: 0 }}>{member.fact}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#484f58", fontSize: 9 }}>ATEEZ · KQ Ent · 2018</span>
          <span style={{ color: rarity.text, fontSize: 9, fontWeight: 700 }}>#{String(idx+1).padStart(3,"0")}/008</span>
        </div>
      </div>
      <style>{`
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }
        @keyframes holoShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
    </div>
  )
}

function CardBack({ member, height }: { member: Member; height: number }) {
  return (
    <div style={{ width: 280, height, borderRadius: 20, background: "linear-gradient(160deg,#111827,#0d1117)", border: `2px solid ${member.color}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .04, backgroundImage: `repeating-linear-gradient(45deg,${member.color} 0px,${member.color} 1px,transparent 1px,transparent 10px)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at center,${member.color}08,transparent 70%)` }} />
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%,${member.color},${member.color}77)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "white", boxShadow: `0 0 40px ${member.color}66`, zIndex: 1 }}>{member.initials}</div>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ color: "white", fontWeight: 900, fontSize: 22, letterSpacing: ".06em" }}>ATINY<span style={{ color: "#58a6ff" }}>TOWN</span></div>
        <div style={{ color: "#484f58", fontSize: 11, marginTop: 4 }}>Member Card Collection</div>
      </div>
      <div style={{ fontSize: 32, zIndex: 1 }}>🏴‍☠️</div>
    </div>
  )
}

function FlipCard({ member, isBias, onClose }: { member: Member; isBias: boolean; onClose: () => void }) {
  const [flipped, setFlipped] = useState(false)
  const [frontHeight, setFrontHeight] = useState(0)
  const frontRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setFrontHeight(node.offsetHeight)
  }, [])

  useEffect(() => { const t = setTimeout(() => setFlipped(true), 300); return () => clearTimeout(t) }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "rgba(0,0,0,.82)", backdropFilter: "blur(4px)", padding: 16, overflowY: "auto" }} onClick={onClose}>
      <div style={{ position: "fixed", width: 300, height: 300, borderRadius: "50%", background: `${member.color}18`, filter: "blur(60px)", pointerEvents: "none", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div onClick={e => { e.stopPropagation(); setFlipped(f => !f) }} style={{ perspective: 1200, cursor: "pointer", zIndex: 1, marginTop: "max(16px, 5vh)", marginBottom: 16 }}>
        <div style={{ position: "relative", transformStyle: "preserve-3d", transition: "transform 0.75s cubic-bezier(0.4,0,0.2,1)", transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)", width: 280, height: frontHeight || "auto" }}>
          {/* Front */}
          <div ref={frontRef} style={{ backfaceVisibility: "hidden", position: "absolute", top: 0, left: 0 }}>
            <HoloCard member={member} isBias={isBias}><CardFront member={member} isBias={isBias} /></HoloCard>
          </div>
          {/* Back — uses measured front height */}
          <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", top: 0, left: 0 }}>
            {frontHeight > 0 && <CardBack member={member} height={frontHeight} />}
          </div>
        </div>
        <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 10 }}>Click to flip · Esc or click outside to close</p>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function MemberDots() {
  const { isSignedIn, isLoaded } = useUser()
  const [selected, setSelected]       = useState<Member | null>(null)
  const [bias, setBias]               = useState<Member | null>(null)
  const [holdTimer, setHoldTimer]     = useState<ReturnType<typeof setTimeout> | null>(null)
  const [holdingName, setHoldingName] = useState<string | null>(null)
  const [syncing, setSyncing]         = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    try {
      const local = localStorage.getItem("atinytown_bias")
      if (local) { const f = MEMBERS.find(m => m.name === local); if (f) setBias(f) }
    } catch {}
    if (isSignedIn) fetchBiasFromDB()
  }, [isLoaded, isSignedIn])

  const fetchBiasFromDB = async () => {
    try {
      const res = await fetch("/api/user-bias")
      if (!res.ok) return
      const { bias: saved } = await res.json()
      if (saved) {
        const f = MEMBERS.find(m => m.name === saved)
        if (f) { setBias(f); localStorage.setItem("atinytown_bias", f.name) }
      } else {
        setBias(null); localStorage.removeItem("atinytown_bias")
      }
    } catch {}
  }

  const saveBias = useCallback(async (member: Member | null) => {
    try {
      if (member) localStorage.setItem("atinytown_bias", member.name)
      else localStorage.removeItem("atinytown_bias")
    } catch {}
    if (isSignedIn) {
      setSyncing(true)
      try { await fetch("/api/user-bias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bias: member?.name ?? null }) }) }
      catch {} finally { setSyncing(false) }
    }
  }, [isSignedIn])

  const handlePressStart = (m: Member) => {
    setHoldingName(m.name)
    const t = setTimeout(() => {
      const next = bias?.name === m.name ? null : m
      setBias(next); saveBias(next); setHoldingName(null)
    }, 500)
    setHoldTimer(t)
  }

  const handlePressEnd = (m: Member) => {
    if (holdTimer) clearTimeout(holdTimer)
    setHoldTimer(null)
    if (holdingName === m.name) setSelected(m)
    setHoldingName(null)
  }

  const handlePressCancel = () => {
    if (holdTimer) clearTimeout(holdTimer)
    setHoldTimer(null); setHoldingName(null)
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "clamp(4px,1.5%,10px)", padding: "0 2px" }}>
          {MEMBERS.map(m => {
            const isBias    = bias?.name === m.name
            const isHolding = holdingName === m.name
            return (
              <div
                key={m.name}
                title={m.name}
                onMouseDown={() => handlePressStart(m)}
                onMouseUp={() => handlePressEnd(m)}
                onMouseLeave={handlePressCancel}
                onTouchStart={e => { e.preventDefault(); handlePressStart(m) }}
                onTouchEnd={e => { e.preventDefault(); handlePressEnd(m) }}
                style={{
                  width: "clamp(48px,10%,72px)", height: "clamp(32px,5%,44px)", borderRadius: 10,
                  background: `linear-gradient(135deg,${m.color},${m.color}aa)`,
                  border: isBias ? `2px solid ${m.color}` : `1.5px solid ${m.color}77`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "clamp(8px,1.2vw,12px)", fontWeight: 900,
                  color: "rgba(255,255,255,.95)", textShadow: "0 1px 3px rgba(0,0,0,.5)",
                  cursor: "pointer", userSelect: "none",
                  boxShadow: isBias ? `0 0 28px ${m.color}bb,0 0 8px ${m.color},0 4px 12px rgba(0,0,0,.5)` : `0 0 10px ${m.color}44,0 2px 6px rgba(0,0,0,.5)`,
                  transform: isHolding ? "scale(1.15)" : isBias ? "scale(1.05) translateY(-2px)" : "scale(1)",
                  transition: "all 0.15s",
                  outline: isBias ? `1px solid ${m.color}55` : "none",
                  outlineOffset: 3,
                }}
              >{m.initials}</div>
            )
          })}
        </div>
      </div>

      {selected && (
        <FlipCard
          member={selected}
          isBias={bias?.name === selected.name}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}