"use client"

import { useState } from "react"
import { BookOpen, Volume2, BarChart3, Users, Smartphone, Check, X } from "lucide-react"

export default function StreamingGuideButton() {
  const [open, setOpen] = useState(false)

  const card = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "14px 16px",
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: "rgba(22,32,56,0.85)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12, color: "#8b949e", fontWeight: 600, fontSize: 13,
        padding: "12px 20px", cursor: "pointer",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#8b949e"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)" }}
    >
      <BookOpen style={{ width: 15, height: 15 }} />
      Streaming Guide
    </button>
  )

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)", zIndex: 100 }} onClick={() => setOpen(false)} />
      <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, maxWidth: 760, width: "100%", maxHeight: "82vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "relative", textAlign: "center", flexShrink: 0 }}>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 20, background: "linear-gradient(90deg,#58a6ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              ATEEZ Streaming Guide 🏴‍☠️
            </h2>
            <p style={{ color: "#8b949e", fontSize: 12, margin: "4px 0 0" }}>Everything you need to know to support ATEEZ effectively</p>
            <button onClick={() => setOpen(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#484f58", cursor: "pointer", display: "flex" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Why Stream */}
            <section>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 14, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                <BarChart3 style={{ width: 15, height: 15, color: "#58a6ff" }} /> Why Streaming Matters
              </h3>
              <div style={card}>
                <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 8px" }}>Streaming helps ATEEZ in multiple ways:</p>
                {["Chart positions on Billboard, Melon, and other platforms", "Increases visibility and algorithm recommendations", "Shows support for music show wins and awards"].map(t => (
                  <div key={t} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                    <Check style={{ width: 13, height: 13, color: "#22c55e", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "#8b949e", fontSize: 12 }}>{t}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* DO / DON'T */}
            <section>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 14, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                <Volume2 style={{ width: 15, height: 15, color: "#a78bfa" }} /> Effective Streaming Tips
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={card}>
                  <p style={{ color: "white", fontWeight: 700, fontSize: 12, margin: "0 0 8px" }}>✅ DO:</p>
                  {["Listen at 50%+ volume", "Make playlists 1-2 hours long", "Stream for at least 30 seconds", "Mix in other artists' songs", "Use different devices/accounts", "Pause, skip and take breaks"].map(t => (
                    <p key={t} style={{ color: "#8b949e", fontSize: 12, margin: "0 0 3px" }}>• {t}</p>
                  ))}
                </div>
                <div style={card}>
                  <p style={{ color: "white", fontWeight: 700, fontSize: 12, margin: "0 0 8px" }}>❌ DON'T:</p>
                  {["Mute the audio", "Loop the same song endlessly", "Use VPNs (can flag as spam)", "Skip songs repeatedly", "Use bots or automation"].map(t => (
                    <p key={t} style={{ color: "#8b949e", fontSize: 12, margin: "0 0 3px" }}>• {t}</p>
                  ))}
                </div>
              </div>
            </section>

            {/* Detailed tips */}
            <section>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 14, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                <Smartphone style={{ width: 15, height: 15, color: "#22c55e" }} /> Detailed Tips
              </h3>
              <div style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { title: "Non-ATEEZ Songs", points: ["Set your playlists up to be similar to your usual listening habits.", "You can add ATEEZ songs not part of the new release as well.", "If you listen to ATEEZ songs often, adding more ATEEZ filler songs is fine. If you tend to listen to many non-ATEEZ artists, add more of them as fillers.", "Try not to include non-ATEEZ songs that were recently released for charting purposes."] },
                  { title: "Spacing", points: ["Playlists should be around 1-2 hours long, with varying filler songs.", "Spacing should be roughly 1-7 filler songs between focus songs (new releases).", "Don't hesitate to have a focus song back to back once or twice — that is still normal behaviour."] },
                  { title: "Prioritise Manual Streaming", points: ["Search for ATEEZ songs and albums on the platforms.", "If you're unable to stream manually, join Stationhead streaming parties.", "Change up the way you stream.", "In addition to personal playlists, use official playlisting from the platforms."] },
                ].map(({ title, points }) => (
                  <div key={title}>
                    <p style={{ color: "white", fontWeight: 700, fontSize: 12, margin: "0 0 6px" }}>{title}</p>
                    {points.map(p => <p key={p} style={{ color: "#8b949e", fontSize: 12, margin: "0 0 3px" }}>• {p}</p>)}
                  </div>
                ))}
                <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 4 }}>
                  Check out our ATINY streaming accounts for more tips! @9024fm @atz_playlist @ateezrendezvous @AtzBluebirdFM on X
                </p>
              </div>
            </section>

            {/* Stationhead */}
            <section>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 14, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7 }}>
                <Users style={{ width: 15, height: 15, color: "#f472b6" }} /> Stationhead Group Streaming
              </h3>
              <div style={card}>
                <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 8px" }}>Join group streaming sessions on Stationhead to maximize impact:</p>
                {["Download the Stationhead app", "Connect your Spotify/Apple Music account", "Join ATEEZ streaming parties", "Your streams count + community engagement"].map(t => (
                  <p key={t} style={{ color: "#8b949e", fontSize: 12, margin: "0 0 3px" }}>• {t}</p>
                ))}
              </div>
            </section>

            {/* Track stats */}
            <section>
              <div style={{ background: "linear-gradient(135deg,rgba(88,166,255,0.08),rgba(167,139,250,0.08))", border: "1px solid rgba(88,166,255,0.15)", borderRadius: 10, padding: "12px 16px" }}>
                <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>
                  📊 Link your stats.fm account on this page to track your personal streaming stats and contribute to community goals!
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={() => setOpen(false)} style={{ background: "#e6edf3", color: "#0d1117", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "8px 20px", border: "none", cursor: "pointer" }}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}