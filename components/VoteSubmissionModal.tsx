"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

interface VoteSubmissionModalProps {
  sourceId: string
  campaignId: string
  hashtag: string
  awardShow: string
  onClose: () => void
}

type VoteType = "web" | "instagram"
type SubmitStatus = "idle" | "uploading" | "success" | "error"

export default function VoteSubmissionModal({
  sourceId, campaignId, hashtag, awardShow, onClose
}: VoteSubmissionModalProps) {
  const { user } = useUser()
  const [voteType, setVoteType] = useState<VoteType>("web")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [message, setMessage] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setMessage("Only image files accepted")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setMessage("File too large — max 10MB")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setMessage("")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file || !user) return
    setStatus("uploading")

    const fd = new FormData()
    fd.append("file", file)
    fd.append("sourceId", sourceId)
    fd.append("campaignId", campaignId)
    fd.append("voteType", voteType)
    fd.append("hashtag", hashtag)

    try {
      const res = await fetch("/api/voting/submissions", { method: "POST", body: fd })
      const data = await res.json()

      if (!res.ok) {
        setStatus("error")
        setMessage(data.error || "Submission failed")
        return
      }

      setStatus("success")
      setMessage(data.message)
    } catch {
      setStatus("error")
      setMessage("Something went wrong — please try again")
    }
  }

  const guidelines = voteType === "web"
    ? [
        `"ATEEZ" visible as the artist name`,
        `Number "30" shown as your vote count`,
        `"0 votes remaining" confirming all votes cast`,
        "Voting UI clearly visible",
      ]
    : [
        `Your comment containing ${hashtag} visible`,
        "Comment shown as posted on the AMA Instagram post",
        "Hashtag text clearly readable",
      ]

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Submit Vote Proof</div>
            <div style={{ fontSize: 11, color: "#484f58", marginTop: 2 }}>{awardShow}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer" }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <CheckCircle style={{ width: 48, height: 48, color: "#22c55e", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>Submitted!</div>
              <div style={{ fontSize: 13, color: "#8b949e", lineHeight: 1.6 }}>{message}</div>
              <button onClick={onClose} style={{ marginTop: 24, background: "#22c55e", border: "none", borderRadius: 10, padding: "10px 24px", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Vote type toggle */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#484f58", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>Vote type</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["web", "instagram"] as VoteType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setVoteType(t)}
                      style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${voteType === t ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`, background: voteType === t ? "rgba(249,115,22,0.1)" : "transparent", color: voteType === t ? "#f97316" : "#8b949e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {t === "web" ? "🌐 Website Vote" : "📸 Instagram Comment"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guidelines */}
              <div style={{ background: "rgba(88,166,255,0.06)", border: "1px solid rgba(88,166,255,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#58a6ff", marginBottom: 8 }}>Screenshot must show:</div>
                {guidelines.map((g, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#8b949e", display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span> {g}
                  </div>
                ))}
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${preview ? "rgba(249,115,22,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: preview ? 0 : "32px 20px", textAlign: "center", cursor: "pointer", marginBottom: 14, overflow: "hidden", transition: "border-color .2s", position: "relative", minHeight: preview ? 200 : "auto" }}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }} />
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(null) }}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: 32, height: 32, color: "#484f58", margin: "0 auto 10px" }} />
                    <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>Tap to upload or drag & drop</div>
                    <div style={{ fontSize: 11, color: "#484f58" }}>PNG, JPG up to 10MB</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>

              {message && status === "error" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#ef4444" }}>
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} /> {message}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!file || status === "uploading"}
                style={{ width: "100%", background: !file ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#f97316,#fbbf24)", border: "none", borderRadius: 10, padding: "12px 0", color: !file ? "#484f58" : "white", fontWeight: 700, fontSize: 14, cursor: !file ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {status === "uploading" ? (
                  <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Submitting...</>
                ) : "Submit Proof"}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </>
          )}
        </div>
      </div>
    </div>
  )
}