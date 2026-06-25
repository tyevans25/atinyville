"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react"
import Navigation from "@/components/Navigation"
import Image from "next/image"

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_CLERK_USER_ID

interface Submission {
  id: string
  userId: string
  sourceId: string
  campaignId: string
  voteType: "web" | "instagram"
  hashtag: string | null
  imageUrl: string
  submittedAt: string
  aiPass: boolean
  aiReason: string
  aiConfidence: number
  status: string
}

export default function VoteAdminPage() {
  const { user, isLoaded } = useUser()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const isAdmin = isLoaded && user?.id === ADMIN_USER_ID

  useEffect(() => {
    if (isAdmin) fetchQueue()
  }, [isAdmin])

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/voting/review")
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (submissionId: string, action: "approve" | "reject") => {
    setActionLoading(submissionId + action)
    try {
      const res = await fetch("/api/voting/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action }),
      })
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId))
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (!isLoaded) return null

  if (!isAdmin) {
    return (
      <>
        <Navigation />
        <div style={{ background: "#0d1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: "#484f58" }}>
            <XCircle style={{ width: 48, height: 48, margin: "0 auto 16px", color: "#ef4444" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>Access Denied</div>
            <div style={{ fontSize: 13 }}>This page is restricted to admins only.</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "88px 24px 56px" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#484f58", textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 6 }}>Admin</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: "-.02em", margin: 0 }}>
                Vote Proof Review
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#f97316" }}>
                {submissions.length} pending
              </div>
              <button onClick={fetchQueue} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", color: "#8b949e", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#484f58" }}>
              <Loader2 style={{ width: 32, height: 32, margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
              Loading queue...
            </div>
          ) : submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <CheckCircle style={{ width: 48, height: 48, color: "#22c55e", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>All caught up!</div>
              <div style={{ fontSize: 13, color: "#484f58" }}>No pending submissions to review.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {submissions.map(sub => (
                <div key={sub.id} style={{ background: "rgba(22,32,56,0.85)", border: `1px solid ${sub.aiPass ? "rgba(255,255,255,0.08)" : "rgba(249,115,22,0.2)"}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

                    {/* AI verdict */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: sub.aiPass ? "rgba(34,197,94,0.1)" : "rgba(249,115,22,0.1)", border: `1px solid ${sub.aiPass ? "rgba(34,197,94,0.25)" : "rgba(249,115,22,0.25)"}`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: sub.aiPass ? "#22c55e" : "#f97316", flexShrink: 0 }}>
                      {sub.aiPass ? "✓ AI Pass" : "⚠ AI Flag"} {sub.aiConfidence > 0 && `(${sub.aiConfidence}%)`}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                        {sub.voteType === "web" ? "🌐 Website Vote" : "📸 Instagram Comment"} — {sub.campaignId}
                      </div>
                      <div style={{ fontSize: 11, color: "#484f58", marginTop: 2 }}>
                        {sub.hashtag && <span style={{ color: "#58a6ff", marginRight: 8 }}>{sub.hashtag}</span>}
                        {new Date(sub.submittedAt).toLocaleString()} · User: {sub.userId.slice(0, 16)}...
                      </div>
                      {sub.aiReason && (
                        <div style={{ fontSize: 11, color: sub.aiPass ? "#22c55e" : "#f97316", marginTop: 3, fontStyle: "italic" }}>
                          AI: {sub.aiReason}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 12px", color: "#8b949e", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {expanded === sub.id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "reject")}
                        disabled={!!actionLoading}
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "7px 14px", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, opacity: actionLoading ? .6 : 1 }}
                      >
                        {actionLoading === sub.id + "reject" ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <XCircle style={{ width: 13, height: 13 }} />}
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "approve")}
                        disabled={!!actionLoading}
                        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 8, padding: "7px 14px", color: "#22c55e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, opacity: actionLoading ? .6 : 1 }}
                      >
                        {actionLoading === sub.id + "approve" ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <CheckCircle style={{ width: 13, height: 13 }} />}
                        Approve
                      </button>
                    </div>
                  </div>

                  {expanded === sub.id && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "14px 18px", background: "rgba(0,0,0,0.2)" }}>
                      <img
                        src={sub.imageUrl}
                        alt="Submission proof"
                        style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain", borderRadius: 10, display: "block", margin: "0 auto" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}