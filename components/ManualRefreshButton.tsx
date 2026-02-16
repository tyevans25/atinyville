"use client"

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

interface RefreshStatus {
  refreshesRemaining: number
  maxRefreshes: number
  timeUntilNextRefresh: number
}

export default function CompactRefreshButton() {
  const [status, setStatus] = useState<RefreshStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    checkStatus()
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
        setMessage(`${data.message}`)
        await checkStatus()
        
        // Reload page after 2 seconds to show new data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(data.message || 'Failed to refresh')
        setTimeRemaining(data.remainingTime || 0)
      }
    } catch (error) {
      setMessage('Error refreshing streams')
    } finally {
      setRefreshing(false)
    }
  }

  if (!status) return null

  const canRefresh = status.refreshesRemaining > 0 && timeRemaining === 0
  const minutesRemaining = Math.ceil(timeRemaining / 60000)
  const secondsRemaining = Math.ceil((timeRemaining % 60000) / 1000)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={!canRefresh || refreshing}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
          canRefresh && !refreshing
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300'
        }`}
        title={
          timeRemaining > 0 
            ? `Cooldown: ${minutesRemaining}m ${secondsRemaining}s` 
            : `${status.refreshesRemaining} refreshes remaining`
        }
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
        {status.refreshesRemaining < 3 && (
          <span className="text-xs opacity-75">({status.refreshesRemaining})</span>
        )}
      </button>

      {message && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top">
          <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
            message.includes('✅') 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {message}
          </div>
        </div>
      )}
    </div>
  )
}