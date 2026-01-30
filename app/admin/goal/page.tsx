'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface CatalogSong {
  trackId: number
  trackName: string
  addedAt: string
  source: 'auto' | 'manual'
}

export default function AdminDailyGoal() {
  const [catalog, setCatalog] = useState<CatalogSong[]>([])
  const [filteredSongs, setFilteredSongs] = useState<CatalogSong[]>([])
  const [songInput, setSongInput] = useState('')
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [target, setTarget] = useState(500)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  /* ----------------------------- load catalog ----------------------------- */

  useEffect(() => {
    fetchCatalog()
  }, [])

  const fetchCatalog = async () => {
    const res = await fetch('/api/song-catalog')
    const data = await res.json()
    setCatalog(data.songs || [])
    setFilteredSongs(data.songs || [])
  }

  /* ----------------------------- filter songs ----------------------------- */

  useEffect(() => {
    if (!songInput.trim()) {
      setFilteredSongs(catalog)
    } else {
      setFilteredSongs(
        catalog.filter(s =>
          s.trackName.toLowerCase().includes(songInput.toLowerCase())
        )
      )
    }
  }, [songInput, catalog])

  /* ----------------------------- select song ------------------------------ */

  const selectSong = (song: CatalogSong) => {
    setSongInput(song.trackName)
    setSelectedTrackId(song.trackId)
    setShowDropdown(false)
  }

  /* ----------------------------- submit goal ------------------------------ */

  const setGoal = async () => {
    if (!selectedTrackId) {
      setMessage('❌ Please select a song from the catalog')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/daily-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: selectedTrackId,
          trackName: songInput.trim(),
          target
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(`❌ ${data.error}`)
        return
      }

      setMessage(`✅ Daily goal set: "${data.goal.trackName}" (${data.goal.target})`)
      setSongInput('')
      setSelectedTrackId(null)
      setTarget(500)
    } catch (err) {
      console.error(err)
      setMessage('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------------------------------------------------------------- */

  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Admin: Daily Goal</h1>
      <p className="text-sm text-gray-500">
        Select a song from the catalog to set today’s goal
      </p>

      {/* Song Dropdown */}
      <div className="relative song-dropdown-container">
        <label className="text-sm mb-1 block">Song</label>
        <div className="relative">
          <input
            value={songInput}
            placeholder="Search catalog..."
            onChange={(e) => {
              setSongInput(e.target.value)
              setSelectedTrackId(null)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="border p-2 w-full rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <ChevronDown />
          </button>
        </div>

        {showDropdown && filteredSongs.length > 0 && (
          <div className="absolute z-50 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
            {filteredSongs.map(song => (
              <button
                key={song.trackId}
                onClick={() => selectSong(song)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                {song.trackName}
                <span className="text-xs text-gray-400 ml-2">
                  {song.source === 'manual' ? '✋' : '🤖'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Target */}
      <div>
        <label className="text-sm mb-1 block">Target Streams</label>
        <input
          type="number"
          min={1}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="border p-2 w-full rounded"
        />
      </div>

      <Button
        onClick={setGoal}
        disabled={loading || !selectedTrackId}
        className="w-full"
      >
        {loading ? 'Saving...' : 'Set Daily Goal'}
      </Button>

      {message && (
        <p className={message.includes('✅') ? 'text-green-600' : 'text-red-600'}>
          {message}
        </p>
      )}
    </div>
  )
}
