"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push("/admin/stationhead")
        router.refresh()
      } else {
        setError("Incorrect password")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "rgba(22,32,56,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, background: "rgba(88,166,255,0.1)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Lock style={{ width: 22, height: 22, color: "#58a6ff" }} />
          </div>
          <h1 style={{ color: "#e6edf3", fontWeight: 700, fontSize: 20, margin: 0 }}>Admin Access</h1>
          <p style={{ color: "#8b949e", fontSize: 13, marginTop: 6 }}>Enter the admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            disabled={loading}
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 9, padding: "11px 14px", color: "white", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
          />
          {error && <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{ background: loading || !password ? "rgba(88,166,255,0.3)" : "#58a6ff", color: "white", border: "none", borderRadius: 9, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: loading || !password ? "not-allowed" : "pointer", transition: "background 0.2s" }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  )
}
