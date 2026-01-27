'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminGoal() {
  const [song, setSong] = useState('')
  const [target, setTarget] = useState(500)
  const [loading, setLoading] = useState(false)

  const setGoal = async () => {
    if (!song.trim()) {
      alert('Please enter a song name')
      return
    }

    if (!Number.isFinite(target) || target <= 0) {
      alert('Target must be a positive number')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/daily-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: song.trim(),
          target
        })
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err?.error ?? 'Failed to set goal')
        return
      }

      const data = await res.json()
      alert(`✅ Daily goal set successfully!\nSong: ${data.song}\nTarget: ${data.target}`)
      setSong('')
      setTarget(500)

    } catch (err) {
      console.error('Error setting daily goal:', err)
      alert('Network error - check console')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Set Daily Song Goal</h1>
      <p className="text-sm text-gray-600">
        This sets the specific song goal for the homepage
      </p>

      <input
        placeholder="Song name (e.g., Bouncy)"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <input
        type="number"
        min={1}
        step={1}
        placeholder="Target streams"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="border p-2 w-full rounded"
      />

      <Button
        onClick={setGoal}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Set Goal'}
      </Button>
    </div>
  )
}