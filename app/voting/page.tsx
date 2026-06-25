import VotingPage from "@/components/VotingPage"
import Navigation from "@/components/Navigation"

export default function Page() {
  if (process.env.NODE_ENV !== "development") {
    return (
      <>
        <Navigation />
        <div style={{ background: "#0d1117", minHeight: "100vh" }}>
          <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
            <div style={{ position: "absolute", top: "20%", left: "25%", width: 500, height: 500, borderRadius: "50%", background: "rgba(168,85,247,0.04)", filter: "blur(120px)" }} />
          </div>
          <div style={{
            position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto",
            padding: "88px 24px 56px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center"
          }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🗳️</div>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 32, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
              Voting Hub
            </h1>
            <p style={{ color: "#8b949e", fontSize: 15, margin: "0 0 24px", maxWidth: 400, lineHeight: 1.6 }}>
              Organized award show voting for ATINY is coming soon. We&apos;re building something great — check back shortly!
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(22,32,56,0.85)", border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 10, padding: "10px 18px"
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7", animation: "blink 2s ease infinite" }} />
              <span style={{ color: "#a855f7", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>UNDER CONSTRUCTION</span>
            </div>
            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
          </div>
        </div>
      </>
    )
  }
  return <VotingPage />
}