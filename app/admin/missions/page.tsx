'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, RefreshCw, Database } from 'lucide-react'

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

interface CatalogSong {
  trackId: number
  trackName: string
  albumId?: number
  addedAt: string
  source: 'auto' | 'manual'
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [newSong, setNewSong] = useState('')
  const [newTrackId, setNewTrackId] = useState<number | null>(null)
  const [newTarget, setNewTarget] = useState('1')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSong, setEditSong] = useState('')
  const [editTarget, setEditTarget] = useState('')

  const [catalog, setCatalog] = useState<CatalogSong[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSongs, setFilteredSongs] = useState<CatalogSong[]>([])

  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualTrackId, setManualTrackId] = useState('')
  const [manualTrackName, setManualTrackName] = useState('')
  const [manualAlbumId, setManualAlbumId] = useState('')

  // Fetch missions and catalog on load
  useEffect(() => {
    fetchMissions()
    fetchCatalog()
  }, [])

  // Filter catalog based on search input
  useEffect(() => {
    if (!newSong.trim()) {
      setFilteredSongs(catalog)
    } else {
      setFilteredSongs(
        catalog.filter(s =>
          s.trackName.toLowerCase().includes(newSong.toLowerCase())
        )
      )
    }
  }, [newSong, catalog])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.song-dropdown-container')) setShowDropdown(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  /** Fetch missions from backend and ensure all missions have IDs */
  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/daily-missions')
      const data = await res.json()
      const fetchedMissions: Mission[] = (data.missions || []).map((m: any) => ({
        ...m,
        id: m.id ?? `${m.trackId}-${Date.now()}`
      }))
      setMissions(fetchedMissions)
    } catch (error) {
      console.error('Error fetching missions:', error)
    }
  }

  const fetchCatalog = async () => {
    setLoadingCatalog(true)
    try {
      const res = await fetch('/api/song-catalog')
      const data = await res.json()
      setCatalog(data.songs || [])
      setFilteredSongs(data.songs || [])
    } catch (error) {
      console.error('Error fetching catalog:', error)
    } finally {
      setLoadingCatalog(false)
    }
  }

  const syncCatalog = async () => {
    setLoadingCatalog(true)
    try {
      const res = await fetch('/api/sync-catalog', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ ${data.message}`)
        await fetchCatalog()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to sync catalog')
    } finally {
      setLoadingCatalog(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const addManualSong = async () => {
    if (!manualTrackId || !manualTrackName) {
      setMessage('❌ Track ID and Name required')
      return
    }

    try {
      const res = await fetch('/api/song-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songs: [{
            trackId: parseInt(manualTrackId),
            trackName: manualTrackName,
            albumId: manualAlbumId ? parseInt(manualAlbumId) : null
          }],
          source: 'manual'
        })
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ Added "${manualTrackName}" to catalog`)
        setShowManualAdd(false)
        setManualTrackId('')
        setManualTrackName('')
        setManualAlbumId('')
        await fetchCatalog()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to add song')
    } finally {
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const selectSong = (song: CatalogSong) => {
    setNewSong(song.trackName)
    setNewTrackId(song.trackId)
    setShowDropdown(false)
  }

  /** Add a new mission to the list */
  const addMission = () => {
    if (!newSong.trim() || !newTarget || !newTrackId) return

    setMissions([
      ...missions,
      {
        id: `${newTrackId}-${Date.now()}`,
        trackId: newTrackId,
        trackName: newSong.trim(),
        target: parseInt(newTarget)
      }
    ])

    setNewSong('')
    setNewTrackId(null)
    setNewTarget('1')
  }

  const startEdit = (mission: Mission) => {
    setEditingId(mission.id)
    setEditSong(mission.trackName)
    setEditTarget(mission.target.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditSong('')
    setEditTarget('')
  }

  const saveEdit = (id: string) => {
    setMissions(missions.map(m =>
      m.id === id
        ? { ...m, trackName: editSong.trim(), target: parseInt(editTarget) }
        : m
    ))
    cancelEdit()
  }

  const deleteMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id))
  }

  /** Save all missions to backend */
  const saveMissions = async () => {
    if (missions.length === 0) {
      setMessage('❌ Please add at least one mission')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/daily-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions })
      })
      const data = await res.json()
      if (res.ok) {
        // Ensure backend response is always an array
        const savedMissions: Mission[] = (data.missions || []).map((m: any) => ({
          ...m,
          id: m.id ?? `${m.trackId}-${Date.now()}`
        }))
        setMissions(savedMissions)
        setMessage(`✅ ${savedMissions.length} mission(s) saved`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to save missions')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const clearAll = () => {
    if (confirm('Clear all missions?')) setMissions([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* UI components remain identical to your previous version */}
        {/* Add Mission form, catalog sync, manual add, mission list, save button, messages */}
      </div>
    </div>
  )
}
