"use client"

import { useEffect, useState } from 'react'

// All your playlists - just add the IDs here!
const ALL_PLAYLISTS = [
  '2iBybvzTZIf3QZYwYEMDHp',
  '7eSDOXxMUByJ5LThDIPmE7',
  '37i9dQZF1DX4JAvHpjipBk',
  '5HPbPs2aZTdzfVPFbWyVP0',
  '37i9dQZF1DXdlsL6CGuL98',
  '15J5Kq7m5LRTnFX6gxA5yn?',
  '0vuEoEIT2TsnGF2G6oFMgB?',
  '37i9dQZF1DX4eP5ZmHlyY0?',
  '3uv2yGVlVmrrgkLPhl81Hq?',
  '4aJzcmxRKNYg1gSxP58Z7D?',
  '78fGz68TbmIbx2wzER8jYs?',
  '3BPwQkoQH6DrXPtRDowmxP?',
  '0LV4huaaprsQlpm3XqWHeB?',
  '3LWVVtrgd4kqnOhRZt2LCI?',
  '42Opu7UIDWgpLLvEt6xRXK?',
  '2FXGiBnsQGlFlNHeDMEK8c?',
  '2LNCR8gvpa5Z4UjcmWQQnM?',
  '3PHlcnRbIvRYzou2ADbeRw?',
  '1PiI3SJxRZJbBD3bSdhVTj',
  '1Wmz0H7HZHToWgix7kE11c?',
  '2QsWJYoaBN0UH94KjQ78zU?',
  '5pjU67lhqMhAPyGgL26d4e?',
  '2T8jaU5MmFYTkhvH0XTRjb?',
  '3vmYaGZpwXsdZspiOMjlhl?',
  '5eKnykdANytEMg4a4T0ECW?',
  '3sFiE5NqXrCOCblVwD5qza?',
  '2qdjDNrVYJ0b5yYy1104mS?',
  '1M6h6LhuQK3yZ8LyYLSK8t?',
  '0NHwsR9NX4oRGRK3Kp2bRT?',
  '2SnrfuOA16SFHXTmri33ez?',
  '7ydQuUZdnbA0ArCFQ2GrAM?',
  '20Pjv2LL6vooqa7nCanjqr?',
  '73AojyvYy594Frum0RB5UU?',
  '1XNrzOC4VWw4ydC1cQLdGs?',
  '7qf1vLbSXYoIcImudiFZbn?',
  '151WXCjizJwJMjcBymQXzg?',
  '4FNYRtKuuxlSMlQqR4rchR?',
  '5tsUprTdwxbwN8eynNqmX9?',
  '7kEawixF5qTUfcGLPIPb3G?',
  '3PoQVna0g4NVjxs14Z9VHT?',
  '52SX6FUzhgX22dEmlemaO7?',
  '2CUHNPfxBP5YWBxGwFOVKg?',
  '511RbPMRpL8RkRgYvnUJjO?',
  '2L76nnagW5lvgXscHG1wJC?',
  '2Jpl351ZNrSCNZwrQzympH',
  '564ejPLiPp4KSxypysHGYb?',
  '7wZhsky3yL8dLOHnASwook?',
  '4sA1AP2djRUscdQw0SE8Vl?',
  '0JAXPhSr2R78dtJ5e9MymL?',
  '4FNYRtKuuxlSMlQqR4rchR?',
  '5tsUprTdwxbwN8eynNqmX9?',
  '7kEawixF5qTUfcGLPIPb3G?',
  '3PoQVna0g4NVjxs14Z9VHT?',
  '0tcMngTywLWtiXFK6AirO7?',
  '4EROwAjELxE3T7v5wlKDIU?',
  '51PtlJrqBTjRfo8tf7bSJw?',
  '7zREWD3unwdDBZxgLyXwaS?',
  '3vhUWEWLkZG0n8sXNGSdkB?',
  '1rO3kzZpfvS1jgHlwdKhMu?',
  '5ZjdfNzYDcMrub0YIWitld?',
  '1kuVo0aetXABVEaR7czdKj?',
  '76x6AdFdAOj80hs1NFyNVV?',
  '0wZejJvxrHIFr7wID36pwR?',
  '7lRpaH8DtBNlTNPbuVBIsA?',
  '3qBNfpNGUaRdWtPVjF8vmS?',
  '1A0R8ojWAr9sXUKntnezH5?',
  '0xTQK3CCUvF4t2VMNQaZ0Q?',
  '6n2ksTtsII8rEZs7LpvrcJ?',
  '4RCBbXfe1UdurLuCFHejmM?',
  '5mQkoPwC6datCwqbTDIp48?'

  // Add more playlist IDs here...
]

export default function CommunityPlaylists() {
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  const [nextRotation, setNextRotation] = useState<string>('')

  useEffect(() => {
    // Calculate which batch to show based on current hour
    const updatePlaylists = () => {
      const now = Date.now()
      const hoursSinceEpoch = Math.floor(now / (1000 * 60 * 60))
      const totalBatches = Math.ceil(ALL_PLAYLISTS.length / 8)
      const batchNumber = hoursSinceEpoch % totalBatches
      
      const startIndex = batchNumber * 8
      const batch = ALL_PLAYLISTS.slice(startIndex, startIndex + 8)
      
      // If last batch has fewer than 8, fill with first playlists
      if (batch.length < 8) {
        const remaining = 8 - batch.length
        batch.push(...ALL_PLAYLISTS.slice(0, remaining))
      }
      
      setSelectedPlaylists(batch)
      
      // Calculate next rotation time
      const nextHour = Math.ceil(now / (1000 * 60 * 60)) * (1000 * 60 * 60)
      const minutesUntilNext = Math.floor((nextHour - now) / (1000 * 60))
      setNextRotation(`${minutesUntilNext} min`)
    }

    updatePlaylists()
    
    // Update every minute to keep countdown accurate
    const interval = setInterval(updatePlaylists, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (selectedPlaylists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading playlists...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Rotation Info */}
      <div className="flex justify-between items-center">
        <p className="text-gray-300">
          Showing 8 of {ALL_PLAYLISTS.length} playlists • Rotates every hour
        </p>
        <div className="text-right">
          <p className="text-sm text-gray-400">Next rotation in</p>
          <p className="text-lg font-semibold text-white">{nextRotation}</p>
        </div>
      </div>

      {/* 4x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedPlaylists.map((playlistId) => (
          <div key={playlistId} className="rounded-lg overflow-hidden border border-white/20">
            <iframe
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="380"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Bottom Info */}
      <p className="text-xs text-gray-400 text-center">
        💡 Feel free to share your own playlists on X (@AtinyTown_)! ATINY made playlists will also be shared here!
      </p>
    </div>
  )
}