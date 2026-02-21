"use client"

import { useState, useEffect } from 'react'
import VideoCard from '@/components/VideoCard'
import Navigation from '@/components/Navigation'
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, RefreshCw, X } from 'lucide-react'

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

const CATEGORIES = ['Music Video','Performance','Fan Cam','Variety','Guest','Fashion','Dance Practice','Behind the Scenes','Other']

const ERAS = ['All','GOLDEN HOUR : Part.4','GOLDEN HOUR : Part.3','GOLDEN HOUR : Part.1','GOLDEN HOUR : Part.2','THE WORLD EP.FIN : WILL','THE WORLD EP.2 : OUTLAW','THE WORLD EP.1 : MOVEMENT','ZERO : FEVER EPILOGUE','ZERO : FEVER Part.3','ZERO : FEVER Part.2','ZERO : FEVER Part.1','TREASURE EPILOGUE: Action to Answer','TREASURE EP.FIN: All to Action','TREASURE EP.3: One to All','TREASURE EP.2: Zero to One','TREASURE EP.1: All to Zero','Other']

const MEMBERS = ['Hongjoong','Seonghwa','Yunho','Yeosang','San','Mingi','Wooyoung','Jongho']

const MEMBER_COLORS: Record<string, string> = {
  Hongjoong: "#FF6B35", Seonghwa: "#B48EE0", Yunho: "#4FC3F7",
  Yeosang: "#81C784", San: "#F06292", Mingi: "#FFD54F",
  Wooyoung: "#CE93D8", Jongho: "#4DD0E1",
}

function CategoryCarousel({ title, videos }: { title: string; videos: Video[] }) {
  const sorted = [...videos].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
  if (sorted.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    const el = document.getElementById(`carousel-${title}`)
    if (el) el.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
        <h2 style={{ color: "white", fontWeight: 800, fontSize: 18, margin: 0 }}>{title}</h2>
        <span style={{ color: "#484f58", fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 10px", borderRadius: 20 }}>
          {sorted.length} {sorted.length === 1 ? 'video' : 'videos'}
        </span>
      </div>
      <div style={{ position: "relative" }} className="group">
        {sorted.length > 3 && (
          <button onClick={() => scroll('left')} style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </button>
        )}
        <div id={`carousel-${title}`} style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {sorted.map(video => (
            <div key={video.youtubeId} style={{ flexShrink: 0, width: 300 }}>
              <VideoCard video={video} />
            </div>
          ))}
        </div>
        {sorted.length > 3 && (
          <button onClick={() => scroll('right')} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 36, height: 36, borderRadius: "50%", background: "rgba(13,17,23,0.9)", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight style={{ width: 18, height: 18 }} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function MediaHubPage() {
  const [videos, setVideos]                   = useState<Video[]>([])
  const [loading, setLoading]                 = useState(true)
  const [refreshing, setRefreshing]           = useState(false)
  const [selectedYear, setSelectedYear]       = useState('all')
  const [selectedEra, setSelectedEra]         = useState('All')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery]         = useState('')
  const [filtersOpen, setFiltersOpen]         = useState(false)

  useEffect(() => { fetchVideos() }, [])

  const fetchVideos = async (force = false) => {
    try {
      const res = await fetch(force ? '/api/variety-videos?force=true' : '/api/variety-videos')
      if (res.ok) { const d = await res.json(); setVideos(d.videos || []) }
    } catch (e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const toggleMember = (m: string) => setSelectedMembers(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])

  const years = ['all', ...Array.from(new Set(videos.map(v => v.year))).sort((a, b) => b - a)]

  const filtered = videos.filter(v => {
    if (selectedYear !== 'all' && v.year !== parseInt(selectedYear)) return false
    if (selectedEra !== 'All' && v.era !== selectedEra) return false
    if (searchQuery && !v.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedMembers.length > 0) {
      const vm = v.featuredMembers.map(m => m.toLowerCase())
      if (!selectedMembers.every(m => vm.some(x => x.includes(m.toLowerCase())))) return false
    }
    return true
  })

  const byCategory = CATEGORIES.map(c => ({ category: c, videos: filtered.filter(v => v.category === c) }))
  const activeFilters = (selectedYear !== 'all' ? 1 : 0) + (selectedEra !== 'All' ? 1 : 0) + selectedMembers.length

  if (loading) return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: 40, height: 40, color: "#58a6ff", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#8b949e", fontSize: 14 }}>Loading videos...</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        {/* Background atmosphere */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "88px 24px 56px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 36, margin: "0 0 8px", letterSpacing: "-0.01em", textShadow: "0 0 40px rgba(88,166,255,0.2)" }}>ATEEZ Media</h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: "0 0 24px" }}>Music Videos · Performances · Variety Shows</p>

            {/* Search */}
            <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#484f58" }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", background: "rgba(22,32,56,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 14px 11px 40px", color: "white", fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#484f58", cursor: "pointer", display: "flex" }}><X style={{ width: 14, height: 14 }} /></button>}
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ background: "rgba(22,32,56,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", borderBottom: filtersOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }} onClick={() => setFiltersOpen(o => !o)}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Filter style={{ width: 14, height: 14, color: "#58a6ff" }} />
                <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 13 }}>Filters</span>
                {activeFilters > 0 && <span style={{ background: "rgba(88,166,255,0.2)", color: "#58a6ff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10, border: "1px solid rgba(88,166,255,0.3)" }}>{activeFilters}</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={e => { e.stopPropagation(); setRefreshing(true); fetchVideos(true) }} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(88,166,255,0.1)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 7, padding: "4px 10px", color: "#58a6ff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  <RefreshCw style={{ width: 12, height: 12, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                  Refresh
                </button>
                <span style={{ color: "#484f58", fontSize: 12 }}>{filtersOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {filtersOpen && (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Year */}
                <div>
                  <p style={{ color: "#8b949e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Year</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {years.map(y => (
                      <button key={y} onClick={() => setSelectedYear(y.toString())} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: selectedYear === y.toString() ? "#58a6ff" : "rgba(255,255,255,0.05)", color: selectedYear === y.toString() ? "#0d1117" : "#8b949e", boxShadow: selectedYear === y.toString() ? "0 0 12px rgba(88,166,255,0.4)" : "none" }}>
                        {y === 'all' ? 'All Years' : y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Era */}
                <div>
                  <p style={{ color: "#8b949e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Era</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ERAS.map(era => (
                      <button key={era} onClick={() => setSelectedEra(era)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap", background: selectedEra === era ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.05)", color: selectedEra === era ? "#C084FC" : "#8b949e", boxShadow: selectedEra === era ? "0 0 12px rgba(168,85,247,0.3)" : "none" }}>
                        {era}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Members */}
                <div>
                  <p style={{ color: "#8b949e", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Members</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {MEMBERS.map(m => {
                      const active = selectedMembers.includes(m)
                      const col = MEMBER_COLORS[m]
                      return (
                        <button key={m} onClick={() => toggleMember(m)} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: active ? `${col}22` : "rgba(255,255,255,0.05)", color: active ? col : "#8b949e", boxShadow: active ? `0 0 10px ${col}33` : "none", outline: active ? `1px solid ${col}44` : "none" }}>
                          {m}
                        </button>
                      )
                    })}
                    {selectedMembers.length > 0 && (
                      <button onClick={() => setSelectedMembers([])} style={{ padding: "5px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                        Clear ({selectedMembers.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Count */}
          <p style={{ color: "#484f58", fontSize: 11, marginBottom: 20 }}>
            Showing {filtered.length} of {videos.length} videos
          </p>

          {/* Video carousels */}
          {byCategory.map(({ category, videos }) => (
            <CategoryCarousel key={category} title={category} videos={videos} />
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ color: "#8b949e", fontSize: 16, margin: "0 0 6px" }}>No videos found</p>
              <p style={{ color: "#484f58", fontSize: 12 }}>Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}