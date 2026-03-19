"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, RefreshCw, Clock } from "lucide-react"

interface MVStats {
  videoId: string
  title: string
  album: string
  releaseDate: string
  viewCount: number
  likeCount: number
  viewsGainedHour: number
  likesGainedHour: number
  thumbnail: string
  url: string
}

const MILESTONES = [
  1_000_000, 5_000_000, 10_000_000, 20_000_000, 30_000_000,
  40_000_000, 50_000_000, 75_000_000, 100_000_000, 150_000_000,
  200_000_000, 300_000_000, 400_000_000, 500_000_000, 750_000_000,
  1_000_000_000
]

function getNextMilestone(v: number) { return MILESTONES.find(m => m > v) ?? null }
function getPrevMilestone(v: number) { return [...MILESTONES].reverse().find(m => m <= v) ?? 0 }

function fmt(n: number) {
  if (n >= 1e9) return `${(n/1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n/1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`
  return n.toLocaleString()
}
function fmtGain(n: number) {
  if (n === 0) return "—"
  const s = n > 0 ? "+" : ""
  if (Math.abs(n) >= 1e6) return `${s}${(n/1e6).toFixed(2)}M`
  if (Math.abs(n) >= 1e3) return `${s}${(n/1e3).toFixed(1)}K`
  return `${s}${n.toLocaleString()}`
}
function fmtMs(n: number) {
  if (n >= 1e9) return `${n/1e9}B`
  if (n >= 1e6) return `${n/1e6}M`
  if (n >= 1e3) return `${n/1e3}K`
  return n.toLocaleString()
}
function eta(views: number, gain: number, target: number) {
  if (gain <= 0) return "—"
  const h = (target - views) / gain
  if (h < 1) return `~${Math.round(h*60)}m`
  if (h < 24) return `~${Math.round(h)}h`
  if (h < 168) return `~${Math.round(h/24)}d`
  return `~${Math.round(h/168)}w`
}
function shortTitle(t: string) {
  return t.replace(/ATEEZ\(에이티즈\)\s*[-–]\s*/,'').replace(/\s*Official\s*MV\s*/i,'').replace(/'/g,"'").trim()
}

function MilestoneBar({ video }: { video: MVStats }) {
  const next = getNextMilestone(video.viewCount)
  const prev = getPrevMilestone(video.viewCount)
  if (!next) return <div style={{color:"#484f58",fontSize:11}}>All milestones reached</div>
  const pct = Math.min(100, ((video.viewCount - prev) / (next - prev)) * 100)
  const isClose = pct >= 85
  const remaining = next - video.viewCount
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:10,color:"#484f58"}}>
          Next: <span style={{color: isClose ? "#f97316" : "#fbbf24", fontWeight:700}}>{fmtMs(next)}</span>
        </span>
        <span style={{fontSize:10,color: isClose ? "#f97316" : "#484f58"}}>
          {fmt(remaining)} away · {eta(video.viewCount, video.viewsGainedHour, next)}
        </span>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:99,
          background: isClose
            ? "linear-gradient(90deg,#f97316,#fbbf24)"
            : "linear-gradient(90deg,#fbbf24,#f97316)",
          boxShadow: isClose ? "0 0 8px rgba(249,115,22,0.5)" : "none",
          transition:"width 1s ease"
        }}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.1)"}}>{fmtMs(prev)}</span>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.1)"}}>{fmtMs(next)}</span>
      </div>
    </div>
  )
}

function NearMilestoneRow({ video }: { video: MVStats }) {
  const next = getNextMilestone(video.viewCount)
  if (!next) return null
  const prev = getPrevMilestone(video.viewCount)
  const pct = Math.round(((video.viewCount - prev) / (next - prev)) * 100)
  return (
    <div style={{
      display:"flex", gap:14, alignItems:"center",
      background:"linear-gradient(135deg,rgba(249,115,22,0.05),rgba(251,191,36,0.04))",
      border:"1px solid rgba(249,115,22,0.15)",
      borderRadius:14, padding:"13px 16px",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"linear-gradient(to bottom,#f97316,#fbbf24)",borderRadius:"14px 0 0 14px"}}/>
      <div style={{width:60,height:34,borderRadius:8,overflow:"hidden",flexShrink:0,position:"relative",marginLeft:6}}>
        <Image src={video.thumbnail} alt={video.title} fill style={{objectFit:"cover"}} sizes="60px"/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <p style={{color:"#e6edf3",fontWeight:700,fontSize:13,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortTitle(video.title)}</p>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <span style={{color:"#484f58",fontSize:11}}>{fmt(video.viewCount)} views</span>
          <span style={{color:"#f97316",fontSize:11,fontWeight:600}}>{fmt(next - video.viewCount)} to {fmtMs(next)} · {eta(video.viewCount,video.viewsGainedHour,next)}</span>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#f97316,#fbbf24)",borderRadius:99,boxShadow:"0 0 6px rgba(249,115,22,0.4)"}}/>
        </div>
      </div>
      <div style={{background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.25)",borderRadius:10,padding:"6px 10px",textAlign:"center",flexShrink:0}}>
        <span style={{color:"#f97316",fontSize:18,fontWeight:900,display:"block",lineHeight:1,fontFamily:"'Bebas Neue',sans-serif"}}>{pct}%</span>
        <span style={{color:"#484f58",fontSize:9,display:"block",marginTop:2}}>there</span>
      </div>
    </div>
  )
}

function MVCard({ video, rank }: { video: MVStats; rank: number }) {
  const [imgErr, setImgErr] = useState(false)
  const isOnFire = video.viewsGainedHour > 200_000
  const isTrending = video.viewsGainedHour > 50_000
  const next = getNextMilestone(video.viewCount)
  const prev = getPrevMilestone(video.viewCount)
  const pct = next ? Math.min(100, ((video.viewCount - prev) / (next - prev)) * 100) : 100
  const isClose = pct >= 85

  const rankStyle: Record<number,{bg:string,border:string,color:string}> = {
    1: {bg:"rgba(255,200,50,0.15)",border:"rgba(255,200,50,0.4)",color:"#ffd700"},
    2: {bg:"rgba(180,180,180,0.1)",border:"rgba(180,180,180,0.3)",color:"#b0b0b0"},
    3: {bg:"rgba(251,146,60,0.1)",border:"rgba(251,146,60,0.3)",color:"#fb923c"},
  }
  const rs = rankStyle[rank] ?? {bg:"rgba(0,0,0,0.55)",border:"rgba(255,255,255,0.08)",color:"#484f58"}

  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
      <div style={{
        background:"linear-gradient(160deg,#0d1117,#060810)",
        border:"1px solid rgba(255,255,255,0.06)",
        borderRadius:16, overflow:"hidden",
        transition:"all 0.2s", cursor:"pointer",
      }}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.border="1px solid rgba(249,115,22,0.3)";el.style.transform="translateY(-3px)";el.style.boxShadow="0 12px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(249,115,22,0.1)"}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.border="1px solid rgba(255,255,255,0.06)";el.style.transform="translateY(0)";el.style.boxShadow="none"}}
      >
        <div style={{position:"relative",aspectRatio:"16/9",overflow:"hidden",background:"#0d1117"}}>
          {!imgErr
            ? <Image src={video.thumbnail} alt={video.title} fill style={{objectFit:"cover"}} onError={()=>setImgErr(true)} sizes="400px"/>
            : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#484f58",fontSize:12}}>No thumbnail</span></div>
          }
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(6,8,16,0.95) 0%,rgba(6,8,16,0.15) 50%,transparent 100%)"}}/>

          <div style={{position:"absolute",top:10,left:10,background:rs.bg,border:`1px solid ${rs.border}`,backdropFilter:"blur(6px)",borderRadius:7,padding:"3px 9px",fontSize:11,fontWeight:800,color:rs.color}}>#{rank}</div>

          {(isTrending||isOnFire) && (
            <div style={{position:"absolute",top:10,right:10,background:isOnFire?"rgba(249,115,22,0.9)":"rgba(251,191,36,0.85)",backdropFilter:"blur(6px)",borderRadius:7,padding:"3px 8px",fontSize:10,fontWeight:700,color:"white"}}>
              {isOnFire ? "🔥 ON FIRE" : "↑ TRENDING"}
            </div>
          )}

          {isClose && next && (
            <div style={{position:"absolute",bottom:44,right:10,background:"rgba(249,115,22,0.85)",backdropFilter:"blur(4px)",borderRadius:7,padding:"3px 8px",fontSize:10,fontWeight:700,color:"white"}}>
              → {fmtMs(next)}
            </div>
          )}

          <div style={{position:"absolute",bottom:10,left:12,right:12,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <p style={{color:"white",fontWeight:900,fontSize:20,margin:0,lineHeight:1,fontFamily:"'Bebas Neue',sans-serif",textShadow:"0 2px 8px rgba(0,0,0,0.9)"}}>{fmt(video.viewCount)}</p>
              <p style={{color:"rgba(255,255,255,0.4)",fontSize:9,margin:"2px 0 0"}}>views</p>
            </div>
            {video.viewsGainedHour > 0 && (
              <div style={{textAlign:"right"}}>
                <p style={{color:"#f97316",fontWeight:700,fontSize:13,margin:0,textShadow:"0 0 12px rgba(249,115,22,0.5)"}}>{fmtGain(video.viewsGainedHour)}</p>
                <p style={{color:"#484f58",fontSize:9,margin:"2px 0 0"}}>/ hour</p>
              </div>
            )}
          </div>
        </div>

        <div style={{padding:"12px 14px 14px"}}>
          <p style={{color:"#e6edf3",fontWeight:700,fontSize:13,margin:"0 0 2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shortTitle(video.title)}</p>
          <p style={{color:"#484f58",fontSize:11,margin:"0 0 10px"}}>{video.album}{video.releaseDate ? ` · ${video.releaseDate}` : ""}</p>
          <MilestoneBar video={video}/>
        </div>
      </div>
    </a>
  )
}

export default function MVDashboard() {
  const [videos, setVideos] = useState<MVStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string|null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<"views"|"gain"|"milestone">("views")
  const [filter, setFilter] = useState("all")

  useEffect(() => { fetchData() }, [])

  async function fetchData(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const res = await fetch("/api/youtube-tracker")
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos || [])
        setLastUpdated(data.lastUpdated)
      }
    } catch(e) { console.error(e) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const albums = ["all", ...Array.from(new Set(videos.map(v => v.album))).sort()]

  const nearMilestone = videos.filter(v => {
    const next = getNextMilestone(v.viewCount)
    if (!next) return false
    const prev = getPrevMilestone(v.viewCount)
    return ((v.viewCount - prev)/(next - prev)) >= 0.85
  }).sort((a,b) => {
    const pa = (()=>{const n=getNextMilestone(a.viewCount)!;const p=getPrevMilestone(a.viewCount);return(a.viewCount-p)/(n-p)})()
    const pb = (()=>{const n=getNextMilestone(b.viewCount)!;const p=getPrevMilestone(b.viewCount);return(b.viewCount-p)/(n-p)})()
    return pb - pa
  })

  const sorted = [...videos]
    .filter(v => filter === "all" || v.album === filter)
    .sort((a,b) => {
      if (sortBy === "views") return b.viewCount - a.viewCount
      if (sortBy === "gain") return b.viewsGainedHour - a.viewsGainedHour
      const pa=(()=>{const n=getNextMilestone(a.viewCount);if(!n)return 0;const p=getPrevMilestone(a.viewCount);return(a.viewCount-p)/(n-p)})()
      const pb=(()=>{const n=getNextMilestone(b.viewCount);if(!n)return 0;const p=getPrevMilestone(b.viewCount);return(b.viewCount-p)/(n-p)})()
      return pb - pa
    })

  const totalViews = videos.reduce((s,v) => s+v.viewCount, 0)
  const totalGain  = videos.reduce((s,v) => s+v.viewsGainedHour, 0)
  const hottest    = [...videos].sort((a,b) => b.viewsGainedHour - a.viewsGainedHour)[0]

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#060810",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:36,height:36,border:"3px solid #f97316",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"#484f58",fontSize:13,margin:0}}>Loading MV data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{minHeight:"100vh",background:"#060810",fontFamily:"'DM Sans',sans-serif",color:"#e6edf3",position:"relative"}}>

        {/* grid bg — matches photocard gallery */}
        <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(249,115,22,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(249,115,22,0.02) 1px,transparent 1px)",backgroundSize:"48px 48px",pointerEvents:"none",zIndex:0}}/>

        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px 80px",position:"relative",zIndex:1}}>

          {/* Header */}
          <div style={{padding:"24px 0 28px",borderBottom:"1px solid rgba(255,255,255,0.06)",marginBottom:28,animation:"fadeUp 0.4s ease both"}}>
            <div style={{marginBottom:16}}>
              <Link href="/" style={{textDecoration:"none"}}>
                <button style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"6px 12px",color:"#8b949e",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  <ChevronLeft size={13}/> Back
                </button>
              </Link>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:16}}>
              <div>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(28px,5vw,44px)",fontWeight:400,letterSpacing:"0.06em",margin:0,lineHeight:1,color:"white"}}>
                  MV <span style={{color:"#f97316"}}>TRACKER</span>
                </h1>
                <p style={{color:"#484f58",fontSize:12,margin:"6px 0 0",display:"flex",alignItems:"center",gap:6}}>
                  {videos.length} videos tracked
                  {lastUpdated && <><span style={{color:"rgba(255,255,255,0.1)"}}>·</span><Clock size={11} style={{color:"#484f58"}}/>{new Date(lastUpdated).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</>}
                </p>
              </div>
              <button
                onClick={()=>fetchData(true)}
                disabled={refreshing}
                style={{display:"flex",alignItems:"center",gap:7,background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.2)",borderRadius:10,padding:"9px 16px",color:"#f97316",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(249,115,22,0.13)"}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="rgba(249,115,22,0.07)"}
              >
                <RefreshCw size={13} style={{animation:refreshing?"spin 0.8s linear infinite":"none"}}/>{refreshing?"Refreshing...":"Refresh"}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12,marginBottom:32,animation:"fadeUp 0.4s ease 0.05s both"}}>
            {[
              {label:"TOTAL VIEWS",      value:fmt(totalViews),         accent:"#f97316", sub:"across all MVs",     icon:"▲"},
              {label:"VIEWS THIS HOUR",  value:fmtGain(totalGain),      accent:"#fbbf24", sub:"combined gain",      icon:"↑"},
              {label:"HOTTEST RIGHT NOW",value:hottest?shortTitle(hottest.title):"—", accent:"#f97316", sub:hottest?`${fmtGain(hottest.viewsGainedHour)} / hour`:"", icon:"★", small:true},
              {label:"NEAR MILESTONE",   value:`${nearMilestone.length}`,accent:"#fbbf24", sub:`video${nearMilestone.length!==1?"s":""} at 85%+`, icon:"◎"},
            ].map(({label,value,accent,sub,icon,small})=>(
              <div key={label} style={{background:"linear-gradient(160deg,#0d1117,#060810)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"18px 20px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${accent}55,${accent}22,transparent)`}}/>
                <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:accent,filter:"blur(30px)",opacity:0.08}}/>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{width:16,height:16,borderRadius:4,background:`${accent}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:accent}}>{icon}</div>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:"#484f58"}}>{label}</span>
                </div>
                <p style={{
                  color:"#e6edf3",fontWeight:800,margin:"0 0 4px",lineHeight:1.2,
                  fontSize:small?"clamp(13px,1.8vw,15px)":"clamp(18px,2.5vw,24px)",
                  fontFamily:"'Bebas Neue',sans-serif",
                  overflow:"hidden",textOverflow:"ellipsis",
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as any,
                }}>{value}</p>
                {sub && <p style={{fontSize:10,color:"#484f58",margin:0}}>{sub}</p>}
              </div>
            ))}
          </div>

          {/* Near milestone */}
          {nearMilestone.length > 0 && (
            <div style={{marginBottom:36,animation:"fadeUp 0.4s ease 0.1s both"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{height:1,flex:1,background:"rgba(249,115,22,0.2)"}}/>
                <span style={{color:"#f97316",fontWeight:900,fontSize:13,letterSpacing:"0.1em",textTransform:"uppercase"}}>Approaching Milestone</span>
                <div style={{height:1,flex:1,background:"rgba(249,115,22,0.2)"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {nearMilestone.map(v=><NearMilestoneRow key={v.videoId} video={v}/>)}
              </div>
            </div>
          )}

          {/* Sort + filter */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20,animation:"fadeUp 0.4s ease 0.15s both"}}>
            <div style={{display:"flex",gap:6}}>
              {[
                {key:"views",     label:"Most Viewed",    icon:"▲"},
                {key:"gain",      label:"Trending",       icon:"↑"},
                {key:"milestone", label:"Near Milestone", icon:"◎"},
              ].map(({key,label,icon})=>(
                <button key={key} onClick={()=>setSortBy(key as any)} style={{
                  display:"flex",alignItems:"center",gap:6,
                  background: sortBy===key ? "#f97316" : "rgba(255,255,255,0.04)",
                  border:`1px solid ${sortBy===key ? "#f97316" : "rgba(255,255,255,0.08)"}`,
                  borderRadius:8,padding:"7px 14px",
                  color: sortBy===key ? "white" : "#8b949e",
                  fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",
                }}><span style={{fontSize:10}}>{icon}</span>{label}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {albums.map(a=>(
                <button key={a} onClick={()=>setFilter(a)} style={{
                  background: filter===a ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.03)",
                  border:`1px solid ${filter===a ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.06)"}`,
                  borderRadius:7,padding:"5px 11px",
                  color: filter===a ? "#f97316" : "#484f58",
                  fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",
                }}>{a==="all" ? "ALL ERAS" : a}</button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,animation:"fadeUp 0.4s ease 0.2s both"}}>
            {sorted.map((video,i)=><MVCard key={video.videoId} video={video} rank={i+1}/>)}
          </div>

          {sorted.length===0 && (
            <div style={{textAlign:"center",padding:"60px 0",color:"#484f58",fontSize:14}}>No videos for this filter</div>
          )}
        </div>
      </div>
    </>
  )
}