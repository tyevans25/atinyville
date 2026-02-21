"use client"
// ── StatsFmCard ────────────────────────────────────────────
import { useState, useEffect } from "react"
import { Music, Check, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function StatsFmCard() {
  const { isSignedIn } = useUser()
  const [username, setUsername]     = useState("")
  const [saved, setSaved]           = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")
  const [success, setSuccess]       = useState(false)

  useEffect(() => { if (isSignedIn) fetchUsername() }, [isSignedIn])

  const fetchUsername = async () => {
    try {
      const res = await fetch('/api/statsfm/username')
      const data = await res.json()
      if (data.statsfmUsername) setSaved(data.statsfmUsername)
    } catch {}
  }

  const handleSave = async () => {
    if (!username.trim()) { setError('Please enter a username'); return }
    setLoading(true); setError(''); setSuccess(false)
    try {
      const res = await fetch('/api/statsfm/username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statsfmUsername: username.trim() }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save username'); return }
      setSaved(data.username); setSuccess(true); setUsername('')
      setTimeout(() => setSuccess(false), 3000)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const inner = (
    <div style={{ padding: "16px 20px" }}>
      {!isSignedIn ? (
        <p style={{ color: "#8b949e", textAlign: "center", fontSize: 13 }}>Sign in to add your stats.fm username and track your contributions!</p>
      ) : saved ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "12px 14px" }}>
            <Check style={{ width: 16, height: 16, color: "#22c55e", flexShrink: 0 }} />
            <div>
              <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0 }}>Connected!</p>
              <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>@{saved}</p>
            </div>
          </div>
          <p style={{ color: "#8b949e", fontSize: 12 }}>Your streams are being tracked automatically. Check the daily goal to see your contribution!</p>
          <button onClick={() => setSaved(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8b949e", fontSize: 12, padding: "7px 14px", cursor: "pointer" }}>Remove Username</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ color: "#8b949e", fontSize: 12, display: "block", marginBottom: 6 }}>Your stats.fm username:</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="username" disabled={loading}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
            {error   && <p style={{ color: "#f87171", fontSize: 11, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><X style={{ width: 12, height: 12 }} />{error}</p>}
            {success && <p style={{ color: "#22c55e", fontSize: 11, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Check style={{ width: 12, height: 12 }} />Saved successfully!</p>}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "9px 12px" }}>
            <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>💡 Make sure your stats.fm profile is <span style={{ color: "white" }}>public</span> so we can track your streams!</p>
          </div>
          <button onClick={handleSave} disabled={loading || !username.trim()} style={{ background: "#e6edf3", color: "#0d1117", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "10px 20px", border: "none", cursor: loading || !username.trim() ? "not-allowed" : "pointer", opacity: loading || !username.trim() ? 0.5 : 1 }}>
            {loading ? 'Saving...' : 'Save Username'}
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)" }}>
        <Music style={{ width: 15, height: 15, color: "#58a6ff" }} />
        <div>
          <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>Track Your Streams</span>
          <p style={{ color: "#8b949e", fontSize: 11, margin: 0 }}>Add your stats.fm username to automatically track your daily streams</p>
        </div>
      </div>
      {inner}
    </div>
  )
}