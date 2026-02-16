"use client"

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, Zap } from 'lucide-react'

interface RefreshStatus {
  refreshesRemaining: number
  maxRefreshes: number
  timeUntilNextRefresh: number
  tier: string
  autoRefreshInterval: number
}

export default function ManualRefreshButton() {
  const [status, setStatus] = useState<RefreshStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/manual-refresh')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setTimeRemaining(data.timeUntilNextRefresh)
      }
    } catch (error) {
      console.error('Error checking refresh status:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setMessage('')

    try {
      const response = await fetch('/api/manual-refresh', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${data.message} (${data.newStreams || 0} new streams)`)
        await checkStatus() // Refresh status
        
        // Reload page after 2 seconds to show new data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`❌ ${data.message || 'Failed to refresh'}`)
        setTimeRemaining(data.remainingTime || 0)
      }
    } catch (error) {
      setMessage('❌ Error refreshing streams')
    } finally {
      setRefreshing(false)
    }
  }

  if (!status) {
    return (
      <div className="glass-card p-4 animate-pulse">
        <div className="h-10 bg-white/10 rounded"></div>
      </div>
    )
  }

  const canRefresh = status.refreshesRemaining > 0 && timeRemaining === 0
  const minutesRemaining = Math.ceil(timeRemaining / 60000)
  const secondsRemaining = Math.ceil((timeRemaining % 60000) / 1000)

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Manual Refresh
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-400 capitalize">{status.tier} Tier</span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Refreshes Left</p>
          <p className="text-2xl font-bold text-white">
            {status.refreshesRemaining}/{status.maxRefreshes}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Auto-Refresh</p>
          <p className="text-2xl font-bold text-white">
            {status.autoRefreshInterval}min
          </p>
        </div>
      </div>

      {/* Cooldown Timer */}
      {timeRemaining > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-300 text-sm">
            <Clock className="w-4 h-4" />
            <span>
              Cooldown: {minutesRemaining}m {secondsRemaining}s
            </span>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={!canRefresh || refreshing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
          canRefresh && !refreshing
            ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
        }`}
      >
        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Refreshing...' : canRefresh ? 'Refresh Now' : 'On Cooldown'}
      </button>

      {/* Message */}
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.startsWith('✅') 
            ? 'bg-green-500/10 border border-green-500/30 text-green-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Tier Info */}
      <div className="text-xs text-gray-400 text-center pt-2 border-t border-white/10">
        <p>Manually refresh your streams</p>
      </div>
    </div>
  )
}