"use client"

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

interface Video {
  youtubeId: string
  youtubeUrl: string
  title: string
  thumbnail: string
  uploadDate: string
  year: number
  duration: string
  category: string
  era: string
  featuredMembers: string[]
  notes: string
}

export default function VideoCard({ video }: { video: Video }) {
  const [showPlayer, setShowPlayer] = useState(false)

  return (
    <>
      <div style={{
        background: "rgba(22,32,56,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        overflow: "hidden",
      }}
        className="group"
      >
        {/* Thumbnail */}
        <div style={{ position: "relative", aspectRatio: "16/9", cursor: "pointer" }} onClick={() => setShowPlayer(true)}>
          <img src={video.thumbnail} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

          {/* Play overlay */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play style={{ width: 24, height: 24, color: "#0d1117", marginLeft: 3 }} fill="#0d1117" />
            </div>
          </div>

          {video.duration && (
            <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.8)", padding: "2px 8px", borderRadius: 4, color: "white", fontSize: 11, fontWeight: 700 }}>
              {video.duration}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px" }}>
          <h3 style={{ color: "#e6edf3", fontSize: 13, fontWeight: 600, margin: "0 0 10px", lineHeight: 1.4, minHeight: "2.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {video.title}
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {video.category && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(88,166,255,0.15)", color: "#58a6ff", border: "1px solid rgba(88,166,255,0.25)" }}>
                {video.category}
              </span>
            )}
            {video.era && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(192,132,252,0.15)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.25)" }}>
                {video.era}
              </span>
            )}
          </div>

          {video.featuredMembers?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
              {video.featuredMembers.map((member, index) => (
                <span key={index} className="shimmer-member" style={{
                  fontSize: 11, padding: "2px 10px", borderRadius: 999, fontWeight: 700,
                  border: "1px solid rgba(236,72,153,0.3)",
                }}>
                  {member}
                </span>
              ))}
            </div>
          )}

          <p style={{ color: "#484f58", fontSize: 11, margin: "0 0 12px" }}>{video.year}</p>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowPlayer(true)} style={{
              flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "8px 12px", color: "#e6edf3", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <Play style={{ width: 11, height: 11 }} />
              Watch
            </button>
            <button onClick={() => window.open(video.youtubeUrl, '_blank')} style={{
              flex: 1, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "8px 12px", color: "#f87171", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}>
              <ExternalLink style={{ width: 11, height: 11 }} />
              YouTube
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPlayer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
          onClick={() => setShowPlayer(false)}>
          <button style={{ position: "absolute", top: 16, right: 20, color: "#8b949e", background: "none", border: "none", fontSize: 22, cursor: "pointer", fontWeight: 700 }}
            onClick={() => setShowPlayer(false)}>✕</button>
          <div style={{ width: "100%", maxWidth: 900, aspectRatio: "16/9" }} onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              style={{ width: "100%", height: "100%", borderRadius: 12, border: "none", display: "block" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <style>{`
        .shimmer-member {
          background: linear-gradient(90deg, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0.8) 20%, rgba(249,168,212,1) 40%, rgba(236,72,153,0.8) 60%, rgba(236,72,153,0.3) 100%);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerMember 3s linear infinite;
        }
        @keyframes shimmerMember {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>
    </>
  )
}