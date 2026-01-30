"use client"

import { useState, useEffect } from "react"
import { Radio, Users, ExternalLink } from "lucide-react"

export default function StationheadLiveBanner() {
  const [isLive, setIsLive] = useState(false)
  const [listeners, setListeners] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkLiveStatus()
    // Check every minute
    const interval = setInterval(checkLiveStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const checkLiveStatus = async () => {
    try {
      // Use our server-side API (bypasses CORS)
      const response = await fetch('/api/stationhead-live')
      
      if (response.ok) {
        const data = await response.json()
        setIsLive(data.isLive || false)
        setListeners(data.listenerCount || 0)
      } else {
        setIsLive(false)
        setListeners(0)
      }
    } catch (error) {
      console.error('Error checking Stationhead status:', error)
      setIsLive(false)
      setListeners(0)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null // Don't show anything while loading
  }

  if (!isLive) {
    return null // Don't show banner when not live
  }

  return (
    <div className="glass-card border-2 border-red-500/50 bg-gradient-to-r from-red-500/10 to-pink-500/10 mb-6 animate-pulse">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-8 h-8 text-red-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              🔴 LIVE NOW on Stationhead
            </h3>
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {listeners} {listeners === 1 ? 'listener' : 'listeners'}
            </p>
          </div>
        </div>
        <a
          href="https://stationhead.com/atinytown"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center gap-2 transition"
        >
          Join Stream
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}