"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Stream {
  trackId: number
  trackName: string
  albumId: number
  endTime: string
  playedMs: number
}

interface StreamData {
  recentStreams?: Stream[]
  username?: string
}

export default function RecentTracksCard() {
  const { isSignedIn } = useUser()
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      fetchStreams()
      // Refresh every 5 minutes
      const interval = setInterval(fetchStreams, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [isSignedIn])

  const fetchStreams = async () => {
    try {
      const response = await fetch("/api/recent-tracks")
      if (response.ok) {
        const data = await response.json()
        setStreamData(data)
      }
    } catch (error) {
      console.error("Error fetching streams:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!isSignedIn) {
    return (
      <Card className="glass-card">
        <CardHeader className="glass-header-blue text-white">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Recent Tracks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-300 text-center">
            Sign in to see your recent ATEEZ streams
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="glass-header-blue text-white">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Recent Tracks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-400">Loading your streams...</p>
        </CardContent>
      </Card>
    )
  }

  if (!streamData?.recentStreams || streamData.recentStreams.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="glass-header-blue text-white">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Recent Tracks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-white/50 mx-auto mb-3" />
            <p className="text-gray-300">No ATEEZ streams found</p>
            <p className="text-sm text-gray-400 mt-2">Start streaming to see your tracks here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader className="glass-header-blue text-white">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Recent Tracks
          </div>
          <span className="text-sm font-normal text-gray-300">
            {streamData.recentStreams.length} recent ATEEZ streams
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {streamData.recentStreams.map((stream, index) => (
            <div
              key={`${stream.trackId}-${stream.endTime}-${index}`}
              className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/10 transition"
            >
              {/* Album Art */}
              <div className="w-12 h-12 bg-white/10 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://cdn.stats.fm/file/statsfm/images/albums/${stream.albumId}/default`}
                  alt={stream.trackName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const icon = document.createElement('div')
                      icon.innerHTML = '<svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>'
                      parent.appendChild(icon.firstElementChild!)
                    }
                  }}
                />
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {stream.trackName}
                </p>
                <p className="text-gray-400 text-sm">ATEEZ</p>
              </div>

              {/* Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-white text-sm font-medium">
                  {formatDate(stream.endTime)}
                </p>
                <p className="text-gray-400 text-xs flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(stream.endTime)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {streamData.username && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 text-center">
              Synced from stats.fm • @{streamData.username}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}