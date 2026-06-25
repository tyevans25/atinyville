"use client"

import { useEffect, useState } from "react"
import { RefreshCw, Trophy, ChevronLeft, ExternalLink } from "lucide-react"
import Navigation from "@/components/Navigation"
import Image from "next/image"

type AwardResult = "pending" | "nominated" | "won" | "lost"

interface VoteSource {
  id: string
  platform: string
  url: string
  hashtag: string
}

interface MultiplierDay {
  date: string
  multiplier: number
  label: string
}

interface Nomination {
  id: string
  awardShow: string
  awardShowAbbr: string
  awardShowColor: string
  awardShowBg: string
  category: string
  year: number
  result: AwardResult
  details?: string
  officialUrl?: string
  voteSource?: VoteSource
  multiplierDays?: MultiplierDay[]
  votingOpens?: string
  votingCloses?: string
}

interface AwardShow {
  id: string
  name: string
  abbr: string
  logoUrl?: string
  color: string
  bgGradient: string
  orb1?: string
  orb2?: string
  wins: number
  nominations: Nomination[]
}

const SHOWS: AwardShow[] = [
  {
    id: "mma", name: "Melon Music Awards", abbr: "MMA",
    color: "#85B7EB",
    bgGradient: "linear-gradient(160deg,#050e20,#0d2448,#091830)",
    orb1: "rgba(133,183,235,0.55)", orb2: "rgba(55,138,221,0.35)",
    wins: 8,
    nominations: [
      { id: "mma-aoty-2025", awardShow: "Melon Music Awards", awardShowAbbr: "MMA", awardShowColor: "#85B7EB", awardShowBg: "#1a2340", category: "Artist of the Year", year: 2025, result: "pending", officialUrl: "https://melon.com", votingOpens: "2025-04-01", votingCloses: "2025-04-20", voteSource: { id: "mma-ig", platform: "Instagram", url: "https://instagram.com/p/example", hashtag: "#ATEEZ_MMA2025_AOTY" }, multiplierDays: [{ date: "2025-04-03", multiplier: 2, label: "Turbo Day" }, { date: "2025-04-07", multiplier: 2, label: "Turbo Day" }] },
      { id: "mma-aloty-2025", awardShow: "Melon Music Awards", awardShowAbbr: "MMA", awardShowColor: "#85B7EB", awardShowBg: "#1a2340", category: "Album of the Year", year: 2025, result: "pending", officialUrl: "https://melon.com", votingOpens: "2025-04-01", votingCloses: "2025-04-20", voteSource: { id: "mma-ig2", platform: "Instagram", url: "https://instagram.com/p/example2", hashtag: "#ATEEZ_MMA2025_ALOTY" }, multiplierDays: [] },
      { id: "mma-aoty-2024", awardShow: "Melon Music Awards", awardShowAbbr: "MMA", awardShowColor: "#85B7EB", awardShowBg: "#1a2340", category: "Artist of the Year", year: 2024, result: "won" },
      { id: "mma-bmg-2024", awardShow: "Melon Music Awards", awardShowAbbr: "MMA", awardShowColor: "#85B7EB", awardShowBg: "#1a2340", category: "Best Male Group", year: 2024, result: "won" },
      { id: "mma-ht-2023", awardShow: "Melon Music Awards", awardShowAbbr: "MMA", awardShowColor: "#85B7EB", awardShowBg: "#1a2340", category: "Hot Trend", year: 2023, result: "nominated" },
    ],
  },
  {
    id: "mama", name: "MAMA Awards", abbr: "MAMA",
    color: "#c084fc",
    bgGradient: "linear-gradient(160deg,#0d0520,#200d40,#130828)",
    orb1: "rgba(192,132,252,0.55)", orb2: "rgba(129,140,248,0.3)",
    wins: 6,
    nominations: [
      { id: "mama-wp-2024", awardShow: "MAMA Awards", awardShowAbbr: "MAMA", awardShowColor: "#c084fc", awardShowBg: "#2d1a40", category: "World Performer", year: 2024, result: "won" },
      { id: "mama-bmg-2024", awardShow: "MAMA Awards", awardShowAbbr: "MAMA", awardShowColor: "#c084fc", awardShowBg: "#2d1a40", category: "Best Male Group", year: 2024, result: "nominated" },
      { id: "mama-aoty-2023", awardShow: "MAMA Awards", awardShowAbbr: "MAMA", awardShowColor: "#c084fc", awardShowBg: "#2d1a40", category: "Artist of the Year", year: 2023, result: "won" },
    ],
  },
  {
    id: "ama", name: "American Music Awards", abbr: "AMA",
    color: "#5DCAA5",
    bgGradient: "linear-gradient(160deg,#041410,#0c3024,#071a14)",
    orb1: "rgba(93,202,165,0.55)", orb2: "rgba(29,158,117,0.3)",
    wins: 2,
    nominations: [
      { id: "ama-fkpa-2025", awardShow: "American Music Awards", awardShowAbbr: "AMA", awardShowColor: "#5DCAA5", awardShowBg: "#1a3040", category: "Favorite K-Pop Artist", year: 2025, result: "pending", officialUrl: "https://americanmusicawards.com", votingOpens: "2025-04-10", votingCloses: "2025-04-30", voteSource: { id: "ama-ig", platform: "Instagram", url: "https://instagram.com/p/ama-example", hashtag: "#MaleKpopATEEZ" }, multiplierDays: [{ date: "2025-04-14", multiplier: 2, label: "Double Points Day" }, { date: "2025-04-21", multiplier: 2, label: "Double Points Day" }] },
      { id: "ama-fkpa-2024", awardShow: "American Music Awards", awardShowAbbr: "AMA", awardShowColor: "#5DCAA5", awardShowBg: "#1a3040", category: "Favorite K-Pop Artist", year: 2024, result: "won" },
      { id: "ama-fkpa-2023", awardShow: "American Music Awards", awardShowAbbr: "AMA", awardShowColor: "#5DCAA5", awardShowBg: "#1a3040", category: "Favorite K-Pop Artist", year: 2023, result: "nominated" },
    ],
  },
  {
    id: "gda", name: "Golden Disc Awards", abbr: "GDA",
    color: "#F09595",
    bgGradient: "linear-gradient(160deg,#150606,#320e0e,#1a0808)",
    orb1: "rgba(240,149,149,0.55)", orb2: "rgba(226,75,74,0.3)",
    wins: 4,
    nominations: [
      { id: "gda-dd-2024", awardShow: "Golden Disc Awards", awardShowAbbr: "GDA", awardShowColor: "#F09595", awardShowBg: "#2a1a1a", category: "Disc Daesang", year: 2024, result: "won" },
      { id: "gda-bmg-2023", awardShow: "Golden Disc Awards", awardShowAbbr: "GDA", awardShowColor: "#F09595", awardShowBg: "#2a1a1a", category: "Best Male Group", year: 2023, result: "nominated" },
    ],
  },
  {
    id: "sma", name: "Seoul Music Awards", abbr: "SMA",
    color: "#EF9F27",
    bgGradient: "linear-gradient(160deg,#130e04,#2e2008,#1a1404)",
    orb1: "rgba(239,159,39,0.55)", orb2: "rgba(186,117,23,0.3)",
    wins: 2,
    nominations: [
      { id: "sma-bon-2024", awardShow: "Seoul Music Awards", awardShowAbbr: "SMA", awardShowColor: "#EF9F27", awardShowBg: "#2a2a1a", category: "Bonsang", year: 2024, result: "won" },
      { id: "sma-dae-2023", awardShow: "Seoul Music Awards", awardShowAbbr: "SMA", awardShowColor: "#EF9F27", awardShowBg: "#2a2a1a", category: "Daesang", year: 2023, result: "nominated" },
    ],
  },
  {
    id: "mbc", name: "MBC Music Festival", abbr: "MBC",
    color: "#97C459",
    bgGradient: "linear-gradient(160deg,#060f06,#122212,#081408)",
    orb1: "rgba(151,196,89,0.55)", orb2: "rgba(99,153,34,0.3)",
    wins: 1,
    nominations: [
      { id: "mbc-aoty-2024", awardShow: "MBC Music Festival", awardShowAbbr: "MBC", awardShowColor: "#97C459", awardShowBg: "#1a2e1a", category: "Artist of the Year", year: 2024, result: "won" },
    ],
  },
]

function isActive(nom: Nomination) {
  if (nom.result !== "pending") return false
  const today = new Date().toISOString().split("T")[0]
  if (nom.votingOpens && today < nom.votingOpens) return false
  if (nom.votingCloses && today > nom.votingCloses) return false
  return true
}

function Badge({ result }: { result: AwardResult }) {
  const map = {
    won:       { label: "Won",       bg: "rgba(34,197,94,0.12)",   color: "#22c55e", border: "rgba(34,197,94,0.25)" },
    nominated: { label: "Nominated", bg: "rgba(88,166,255,0.12)",  color: "#58a6ff", border: "rgba(88,166,255,0.25)" },
    pending:   { label: "Pending",   bg: "rgba(249,115,22,0.12)",  color: "#f97316", border: "rgba(249,115,22,0.25)" },
    lost:      { label: "Not Won",   bg: "rgba(239,68,68,0.12)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
  }
  const b = map[result]
  return <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>{b.label}</span>
}

function ShowTile({ show, onSelectNom }: { show: AwardShow; onSelectNom: (nom: Nomination) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderRadius: 18, overflow: "hidden", cursor: "pointer", position: "relative", background: "#0a0e1a", transition: "transform .2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
    >
      {/* Poster */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden" }} onClick={() => setOpen(o => !o)}>
        <div style={{ position: "absolute", inset: 0, background: show.bgGradient }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 30%,${show.orb1},transparent 55%)` }} />
          <div style={{ position: "absolute", bottom: "20%", right: "-5%", width: 120, height: 120, background: `radial-gradient(circle,${show.orb2},transparent 65%)` }} />
        </div>
        {/* Watermark */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", fontSize: show.abbr.length > 3 ? 68 : 90, fontWeight: 900, letterSpacing: "-.04em", opacity: .08, lineHeight: 1, color: show.color, pointerEvents: "none", whiteSpace: "nowrap" }}>
          {show.abbr}
        </div>
        {/* Live badge */}
        {show.nominations.some(isActive) && (
          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.55)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 999, padding: "3px 8px", fontSize: 9, color: "#22c55e", fontWeight: 700, backdropFilter: "blur(8px)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
            Live
          </div>
        )}
        {/* Glass panel */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 14px 16px", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: ".03em", color: show.color, marginBottom: 3 }}>{show.abbr}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, marginBottom: 10 }}>{show.name}</div>
          <div style={{ display: "flex", gap: 5 }}>
            {[{ n: show.nominations.filter(n => n.result === "won").length, l: "Wins", color: "#22c55e" }, { n: show.nominations.length, l: "Noms", color: show.color }].map(s => (
              <div key={s.l} style={{ flex: 1, textAlign: "center", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "5px 4px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1, color: s.color }}>{s.n}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nominations dropdown */}
      {open && (
        <div style={{ background: "rgba(5,8,18,0.98)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {show.nominations.sort((a, b) => b.year - a.year).map(nom => (
            <div
              key={nom.id}
              onClick={() => onSelectNom(nom)}
              style={{ padding: "9px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background .1s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
            >
              <div>
                <div style={{ fontSize: 12, color: "#c9d1d9" }}>{nom.category}</div>
                <div style={{ fontSize: 10, color: "#484f58", marginTop: 1 }}>{nom.year}</div>
              </div>
              <Badge result={nom.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NominationDetail({ nom, onBack }: { nom: Nomination; onBack: () => void }) {
  const [snapLoading, setSnapLoading] = useState(false)

  const mockDaily = nom.voteSource ? [
    { date: "Apr 1", count: 4200 }, { date: "Apr 2", count: 5100 },
    { date: "Apr 3", count: 11800 }, { date: "Apr 4", count: 5600 },
    { date: "Apr 5", count: 7200 }, { date: "Apr 6", count: 6100 },
    { date: "Apr 7", count: 12400 }, { date: "Apr 8", count: 5800 },
    { date: "Apr 9", count: 6200 }, { date: "Apr 10", count: 9100 },
    { date: "Apr 11", count: 6700 }, { date: "Apr 12", count: 14200 },
    { date: "Apr 13", count: 7100 }, { date: "Apr 14", count: 8200 },
    { date: "Apr 15", count: 10800 }, { date: "Apr 16", count: 9400 },
    { date: "Apr 17", count: 12847 },
  ] : []

  const total = mockDaily.reduce((s, d) => s + d.count, 0)
  const today = mockDaily[mockDaily.length - 1]?.count ?? 0
  const yesterday = mockDaily[mockDaily.length - 2]?.count ?? 0
  const diff = today - yesterday
  const maxCount = Math.max(...mockDaily.map(d => d.count), 1)

  const getTurboForDate = (date: string) =>
    nom.multiplierDays?.find(m => new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) === date)

  const cardStyle: React.CSSProperties = {
    background: "rgba(22,32,56,0.85)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    overflow: "hidden",
  }

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", color: "#8b949e", fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginBottom: 20 }}>
        <ChevronLeft style={{ width: 14, height: 14 }} /> Back to awards
      </button>

      <div style={{ ...cardStyle, borderColor: `${nom.awardShowColor}33`, boxShadow: `0 0 40px ${nom.awardShowColor}0a` }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${nom.awardShowColor},${nom.awardShowColor}88,${nom.awardShowColor})`, backgroundSize: "300% 100%", animation: "shimmer 3s linear infinite" }} />
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.02)", flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${nom.awardShowColor}18`, border: `1px solid ${nom.awardShowColor}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: nom.awardShowColor, flexShrink: 0 }}>{nom.awardShowAbbr}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{nom.category}</div>
            <div style={{ fontSize: 12, color: "#484f58" }}>{nom.awardShow} · {nom.year}</div>
          </div>
          <Badge result={nom.result} />
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {nom.voteSource && (
            <div style={{ background: "rgba(88,166,255,0.06)", border: "1px solid rgba(88,166,255,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#58a6ff" }}>{nom.voteSource.hashtag}</div>
                <div style={{ fontSize: 11, color: "#484f58", marginTop: 2 }}>Scraping {nom.voteSource.platform}{nom.votingCloses ? ` · Closes ${new Date(nom.votingCloses).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</div>
              </div>
              <button onClick={() => { setSnapLoading(true); setTimeout(() => setSnapLoading(false), 1500) }} disabled={snapLoading} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "1px solid rgba(88,166,255,0.3)", borderRadius: 8, padding: "6px 12px", color: "#58a6ff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: snapLoading ? .6 : 1 }}>
                <RefreshCw style={{ width: 11, height: 11 }} /> {snapLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          )}

          {nom.voteSource && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[{ label: "Total mentions", value: total.toLocaleString(), color: "#58a6ff" }, { label: "Today", value: today.toLocaleString(), color: "white" }, { label: "vs yesterday", value: `${diff >= 0 ? "+" : ""}${diff.toLocaleString()}`, color: diff >= 0 ? "#22c55e" : "#ef4444" }].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#484f58", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {nom.voteSource && mockDaily.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: ".08em" }}>Daily breakdown</span>
                <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#484f58" }}>
                  {[{ c: "#58a6ff", l: "Normal" }, { c: "#f97316", l: "2x Turbo" }, { c: "#BA7517", l: "1.5x Boost" }].map(x => (
                    <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: x.c, display: "inline-block" }} />{x.l}</span>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, minWidth: mockDaily.length * 32, paddingBottom: 20, position: "relative" }}>
                  {mockDaily.map((d, i) => {
                    const md = getTurboForDate(d.date)
                    const barColor = md ? (md.multiplier >= 2 ? "#f97316" : "#BA7517") : "#378ADD"
                    const h = Math.round((d.count / maxCount) * 90)
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative" }}>
                        {md && <div style={{ position: "absolute", top: -18, fontSize: 8, color: barColor, fontWeight: 700, whiteSpace: "nowrap" }}>{md.multiplier}x</div>}
                        <div title={`${d.date}: ${d.count.toLocaleString()}${md ? ` (${md.label})` : ""}`} style={{ width: "100%", height: h, background: barColor, borderRadius: "3px 3px 0 0", opacity: .85, cursor: "pointer" }} />
                        <div style={{ fontSize: 8, color: "#484f58", transform: "rotate(-45deg)", transformOrigin: "top right", whiteSpace: "nowrap", marginTop: 2 }}>{d.date}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#484f58", textAlign: "right", marginTop: 4 }}>* Turbo/boost counts include multiplier</div>
            </div>
          )}

          {nom.multiplierDays && nom.multiplierDays.length > 0 && (
            <div>
              <div style={{ color: "#8b949e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Multiplier days</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {nom.multiplierDays.map((md, i) => (
                  <div key={i} style={{ background: md.multiplier >= 2 ? "rgba(249,115,22,0.1)" : "rgba(186,117,23,0.1)", border: `1px solid ${md.multiplier >= 2 ? "rgba(249,115,22,0.3)" : "rgba(186,117,23,0.3)"}`, borderRadius: 8, padding: "5px 10px", fontSize: 11 }}>
                    <span style={{ color: md.multiplier >= 2 ? "#f97316" : "#BA7517", fontWeight: 700 }}>{md.multiplier}x {md.label}</span>
                    <span style={{ color: "#484f58", marginLeft: 6 }}>{new Date(md.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!nom.voteSource && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#484f58", fontSize: 13 }}>No fan voting tracked for this nomination.</div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {nom.officialUrl && (
              <button onClick={() => window.open(nom.officialUrl, "_blank")} style={{ display: "flex", alignItems: "center", gap: 6, background: "#e6edf3", color: "#0d1117", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Vote Now <ExternalLink style={{ width: 12, height: 12 }} />
              </button>
            )}
            {nom.voteSource && (
              <button onClick={() => window.open(nom.voteSource!.url, "_blank")} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", color: "#8b949e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                View source <ExternalLink style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:300% 50%} }`}</style>
    </div>
  )
}

function ActiveVotingCard({ show, onSelectNom }: { show: AwardShow; onSelectNom: (nom: Nomination) => void }) {
  const activeNoms = show.nominations.filter(isActive)
  if (activeNoms.length === 0) return null
  const closingDate = activeNoms[0].votingCloses

  return (
    <div style={{ background: "rgba(13,17,35,0.95)", border: `1px solid ${show.color}33`, borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${show.color}18`, border: `1px solid ${show.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: show.color, flexShrink: 0 }}>{show.abbr}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{show.name} {new Date().getFullYear()}</div>
          <div style={{ fontSize: 11, color: "#484f58" }}>{activeNoms.length} nomination{activeNoms.length > 1 ? "s" : ""} · fan voting open</div>
        </div>
        {closingDate && <span style={{ background: "rgba(249,115,22,0.12)", color: "#f97316", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>Closes {new Date(closingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
      </div>
      {activeNoms.map(nom => {
        const isTurboToday = nom.multiplierDays?.some(m => m.date === new Date().toISOString().split("T")[0])
        return (
          <div key={nom.id} onClick={() => onSelectNom(nom)} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{nom.category}</div>
              {nom.voteSource && <span style={{ fontSize: 11, color: "#58a6ff", background: "rgba(88,166,255,0.08)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 6, padding: "2px 8px", display: "inline-block", marginTop: 4 }}>{nom.voteSource.hashtag}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>—</div>
                <div style={{ fontSize: 10, color: "#484f58" }}>today</div>
                {isTurboToday && <div style={{ fontSize: 10, color: "#f97316" }}>Turbo Day!</div>}
              </div>
              {isTurboToday && <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}><div style={{ fontSize: 15, fontWeight: 800, color: "#f97316" }}>2x</div><div style={{ fontSize: 9, color: "#f97316", letterSpacing: ".05em" }}>TURBO</div></div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function VotingPage() {
  const [selectedNom, setSelectedNom] = useState<Nomination | null>(null)

  const totalNoms = SHOWS.reduce((s, sh) => s + sh.nominations.length, 0)
  const totalWins = SHOWS.reduce((s, sh) => s + sh.nominations.filter(n => n.result === "won").length, 0)
  const activeNoms = SHOWS.reduce((s, sh) => s + sh.nominations.filter(isActive).length, 0)
  const activeShows = SHOWS.filter(sh => sh.nominations.some(isActive))

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "88px 24px 56px" }}>
          {selectedNom ? (
            <NominationDetail nom={selectedNom} onBack={() => setSelectedNom(null)} />
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>
                    <Trophy style={{ width: 12, height: 12, color: "#f97316" }} />
                    ATINYTOWN
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1, color: "white" }}>Voting Tracker</span>
                    {activeNoms > 0 && <span style={{ fontSize: 14, fontWeight: 700, color: "#f97316", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 8, padding: "3px 10px", letterSpacing: ".04em", textTransform: "uppercase" }}>Live</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  {[{ n: totalNoms, l: "Nominations", c: "#58a6ff" }, { n: totalWins, l: "Wins", c: "#22c55e" }, { n: activeNoms, l: "Active", c: "#f97316" }].map((s, i, arr) => (
                    <div key={s.l} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: s.c }}>{s.n}</div>
                        <div style={{ fontSize: 10, color: "#484f58", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 2 }}>{s.l}</div>
                      </div>
                      {i < arr.length - 1 && <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Active voting */}
              {activeShows.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                    Active — vote now
                  </div>
                  {activeShows.map(sh => <ActiveVotingCard key={sh.id} show={sh} onSelectNom={setSelectedNom} />)}
                </div>
              )}

              {/* All shows */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 16 }}>
                  <Trophy style={{ width: 13, height: 13, color: "#fbbf24" }} />
                  All award shows
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 14 }}>
                  {SHOWS.map(sh => <ShowTile key={sh.id} show={sh} onSelectNom={setSelectedNom} />)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}