// Replace your QuizCard component (or wherever the quiz CTA appears on the homepage)
// with this WordleCard component. Drop it in the same spot.

import Link from "next/link"

export function WordleCard() {
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(249,115,22,0.2)",
      background: "rgba(10,18,40,0.5)", backdropFilter: "blur(12px)",
      position: "relative"
    }}>
      {/* Orange accent bar instead of the blue/purple gradient */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #f97316, #ea580c, transparent)" }} />

      <div style={{ padding: "28px 32px", display: "flex", gap: 32, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "white", fontSize: 20, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            {/* Wordle grid icon */}
            <span style={{ display: "inline-grid", gridTemplateColumns: "repeat(3,6px)", gap: 2 }}>
              {["#f97316","#f97316","#262626","#854d0e","#f97316","#262626","#262626","#854d0e","#f97316"].map((c,i) => (
                <span key={i} style={{ width: 6, height: 6, background: c, borderRadius: 1, display: "block" }} />
              ))}
            </span>
            ATINYWORDLE
          </h3>
          <p style={{ color: "#8899BB", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            Guess the daily 5-letter ATEEZ word in 6 tries. New word every day at midnight KST!
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
          <Link href="/wordle" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "13px 30px", borderRadius: 12, fontSize: 15, fontWeight: 800,
              background: "#f97316", color: "white", border: "none", cursor: "pointer",
              boxShadow: "0 0 28px rgba(249,115,22,0.3)",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.2s"
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#ea580c"
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(249,115,22,0.5)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "#f97316"
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(249,115,22,0.3)"
              }}
            >
              Play Today
            </button>
          </Link>
          <p style={{ color: "#4B5E80", fontSize: 11, marginTop: 8 }}>Resets midnight KST</p>
        </div>
      </div>
    </div>
  )
}