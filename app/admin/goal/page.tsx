'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

interface CatalogSong {
  trackId: number
  trackName: string
  source: 'auto' | 'manual'
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [catalog, setCatalog] = useState<CatalogSong[]>([])
  const [newSong, setNewSong] = useState('')
  const [newTrackId, setNewTrackId] = useState<number | null>(null)
  const [newTarget, setNewTarget] = useState('1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSong, setEditSong] = useState('')
  const [editTarget, setEditTarget] = useState('')

  // ✅ Type-safe fetch for missions
  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await fetch('/api/daily-missions')
        const data: { missions?: Partial<Mission>[] } = await res.json()

        const safeMissions: Mission[] = Array.isArray(data.missions)
          ? data.missions.map(m => ({
              id: m?.id || (m?.trackId ? `${m.trackId}-${Date.now()}` : `${Date.now()}`),
              trackId: m?.trackId ?? 0,
              trackName: m?.trackName ?? 'Unknown',
              target: m?.target ?? 1
            }))
          : []

        setMissions(safeMissions)
      } catch (err) {
        console.error('Error fetching missions:', err)
        setMissions([])
      }
    }

    fetchMissions()
  }, [])

  // Fetch catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/song-catalog')
        const data: { songs?: CatalogSong[] } = await res.json()
        setCatalog(data.songs || [])
      } catch (err) {
        console.error('Error fetching catalog:', err)
        setCatalog([])
      }
    }

    fetchCatalog()
  }, [])

  const addMission = () => {
    if (!newSong.trim() || !newTarget || !newTrackId) return
    setMissions([
      ...missions,
      {
        id: `${newTrackId}-${Date.now()}`,
        trackId: newTrackId,
        trackName: newSong,
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

  const saveEdit = (id: string) => {
    setMissions(missions.map(m =>
      m.id === id
        ? { ...m, trackName: editSong, target: parseInt(editTarget) }
        : m
    ))
    setEditingId(null)
    setEditSong('')
    setEditTarget('')
  }

  const deleteMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id))
  }

  const saveMissions = async () => {
    try {
      await fetch('/api/daily-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions })
      })
    } catch (err) {
      console.error('Error saving missions:', err)
    }
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">Admin Missions</h1>

      {/* Add mission */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Song Name"
          value={newSong}
          onChange={e => setNewSong(e.target.value)}
          className="px-2 py-1 text-black"
        />
        <input
          type="number"
          min="1"
          placeholder="Target"
          value={newTarget}
          onChange={e => setNewTarget(e.target.value)}
          className="px-2 py-1 text-black"
        />
        <Button onClick={addMission} className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      {/* Missions list */}
      {missions.map(m => (
        <div key={m.id} className="flex gap-2 mb-2 items-center">
          {editingId === m.id ? (
            <>
              <input
                value={editSong}
                onChange={e => setEditSong(e.target.value)}
                className="px-2 py-1 text-black"
              />
              <input
                type="number"
                min="1"
                value={editTarget}
                onChange={e => setEditTarget(e.target.value)}
                className="px-2 py-1 text-black"
              />
              <Button onClick={() => saveEdit(m.id)}>
                <Check className="w-4 h-4" />
              </Button>
              <Button onClick={() => setEditingId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span>{m.trackName} (Target: {m.target})</span>
              <Button onClick={() => startEdit(m)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button onClick={() => deleteMission(m.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ))}

      <Button onClick={saveMissions} className="mt-4 bg-green-600">
        Save All
      </Button>
    </div>
  )
}
