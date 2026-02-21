"use client"

import { useEffect, useState } from "react"

const ALL_PLAYLISTS = [
  '2iBybvzTZIf3QZYwYEMDHp','7eSDOXxMUByJ5LThDIPmE7','37i9dQZF1DX4JAvHpjipBk',
  '5HPbPs2aZTdzfVPFbWyVP0','37i9dQZF1DXdlsL6CGuL98','15J5Kq7m5LRTnFX6gxA5yn',
  '0vuEoEIT2TsnGF2G6oFMgB','37i9dQZF1DX4eP5ZmHlyY0','3uv2yGVlVmrrgkLPhl81Hq',
  '4aJzcmxRKNYg1gSxP58Z7D','78fGz68TbmIbx2wzER8jYs','3BPwQkoQH6DrXPtRDowmxP',
  '0LV4huaaprsQlpm3XqWHeB','3LWVVtrgd4kqnOhRZt2LCI','42Opu7UIDWgpLLvEt6xRXK',
  '2FXGiBnsQGlFlNHeDMEK8c','2LNCR8gvpa5Z4UjcmWQQnM','3PHlcnRbIvRYzou2ADbeRw',
  '1PiI3SJxRZJbBD3bSdhVTj','1Wmz0H7HZHToWgix7kE11c','2QsWJYoaBN0UH94KjQ78zU',
  '5pjU67lhqMhAPyGgL26d4e','2T8jaU5MmFYTkhvH0XTRjb','3vmYaGZpwXsdZspiOMjlhl',
  '5eKnykdANytEMg4a4T0ECW','3sFiE5NqXrCOCblVwD5qza','2qdjDNrVYJ0b5yYy1104mS',
  '1M6h6LhuQK3yZ8LyYLSK8t','0NHwsR9NX4oRGRK3Kp2bRT','2SnrfuOA16SFHXTmri33ez',
  '7ydQuUZdnbA0ArCFQ2GrAM','20Pjv2LL6vooqa7nCanjqr','73AojyvYy594Frum0RB5UU',
  '1XNrzOC4VWw4ydC1cQLdGs','7qf1vLbSXYoIcImudiFZbn','151WXCjizJwJMjcBymQXzg',
  '4FNYRtKuuxlSMlQqR4rchR','5tsUprTdwxbwN8eynNqmX9','7kEawixF5qTUfcGLPIPb3G',
  '3PoQVna0g4NVjxs14Z9VHT','52SX6FUzhgX22dEmlemaO7','2CUHNPfxBP5YWBxGwFOVKg',
  '511RbPMRpL8RkRgYvnUJjO','2L76nnagW5lvgXscHG1wJC','2Jpl351ZNrSCNZwrQzympH',
  '564ejPLiPp4KSxypysHGYb','7wZhsky3yL8dLOHnASwook','4sA1AP2djRUscdQw0SE8Vl',
  '0JAXPhSr2R78dtJ5e9MymL','0tcMngTywLWtiXFK6AirO7','4EROwAjELxE3T7v5wlKDIU',
  '51PtlJrqBTjRfo8tf7bSJw','7zREWD3unwdDBZxgLyXwaS','3vhUWEWLkZG0n8sXNGSdkB',
  '1rO3kzZpfvS1jgHlwdKhMu','5ZjdfNzYDcMrub0YIWitld','1kuVo0aetXABVEaR7czdKj',
  '76x6AdFdAOj80hs1NFyNVV','0wZejJvxrHIFr7wID36pwR','7lRpaH8DtBNlTNPbuVBIsA',
  '3qBNfpNGUaRdWtPVjF8vmS','1A0R8ojWAr9sXUKntnezH5','0xTQK3CCUvF4t2VMNQaZ0Q',
  '6n2ksTtsII8rEZs7LpvrcJ','4RCBbXfe1UdurLuCFHejmM','5mQkoPwC6datCwqbTDIp48',
]

export default function CommunityPlaylists() {
  const [batch, setBatch]      = useState<string[]>([])
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const hr  = Math.floor(now / 3600000)
      const total = Math.ceil(ALL_PLAYLISTS.length / 8)
      const idx   = hr % total
      const slice = ALL_PLAYLISTS.slice(idx*8, idx*8+8)
      if (slice.length < 8) slice.push(...ALL_PLAYLISTS.slice(0, 8-slice.length))
      setBatch(slice)
      const next = Math.ceil(now/3600000)*3600000
      setCountdown(`${Math.floor((next-now)/60000)} min`)
    }
    update()
    const i = setInterval(update, 60000)
    return () => clearInterval(i)
  }, [])

  if (!batch.length) return <p style={{ color: "#484f58", textAlign: "center", padding: 20, fontSize: 13 }}>Loading playlists...</p>

  return (
    <div>
      {/* Rotation info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>
          Showing 8 of {ALL_PLAYLISTS.length} playlists · Rotates every hour
        </p>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#484f58", fontSize: 10, margin: 0 }}>Next rotation in</p>
          <p style={{ color: "white", fontWeight: 700, fontSize: 13, margin: 0 }}>{countdown}</p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {batch.map(id => (
          <div key={id} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <iframe
              src={`https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`}
              width="100%" height="352" frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 12 }}>
        💡 Share your own playlists on X (@AtinyTown_)! ATINY made playlists will also be featured here!
      </p>
    </div>
  )
}