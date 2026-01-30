'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react'

interface Song {
  trackId: number
  trackName: string
  artist?: string
  addedAt: string
}

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

export default function MissionsAdmin() {
  const [songs, setSongs] = useState<Song[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // New song form
  const [newSongId, setNewSongId] = useState('')
  const [newSongName, setNewSongName] = useState('')
  const [newSongArtist, setNewSongArtist] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch song library
      const songsRes = await fetch('/api/songs')
      if (songsRes.ok) {
        const songsData = await songsRes.json()
        setSongs(songsData.songs || [])
      }

      // Fetch current missions
      const missionsRes = await fetch('/api/missions')
      if (missionsRes.ok) {
        const missionsData = await missionsRes.json()
        setMissions(missionsData.missions || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('error', 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const addSongToLibrary = async () => {
    if (!newSongId || !newSongName) {
      showMessage('error', 'Track ID and name are required')
      return
    }

    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId: parseInt(newSongId),
          trackName: newSongName,
          artist: newSongArtist || undefined
        })
      })

      const data = await res.json()

      if (res.ok) {
        setSongs([...songs, data.song])
        setNewSongId('')
        setNewSongName('')
        setNewSongArtist('')
        showMessage('success', 'Song added to library')
      } else {
        showMessage('error', data.error || 'Failed to add song')
      }
    } catch (error) {
      console.error('Error adding song:', error)
      showMessage('error', 'Failed to add song')
    }
  }

  const addMission = () => {
    const newMission: Mission = {
      id: `mission-${Date.now()}`,
      trackId: 0,
      trackName: '',
      target: 100
    }
    setMissions([...missions, newMission])
  }

  const updateMission = (id: string, field: keyof Mission, value: any) => {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const removeMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id))
  }

  const selectSongForMission = (missionId: string, song: Song) => {
    setMissions(missions.map(m => 
      m.id === missionId 
        ? { ...m, trackId: song.trackId, trackName: song.trackName }
        : m
    ))
  }

  const saveMissions = async () => {
    // Validate missions
    for (const mission of missions) {
      if (!mission.trackId || !mission.trackName || !mission.target) {
        showMessage('error', 'All missions must have a song and target')
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions })
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('success', `Missions saved for ${data.date}`)
      } else {
        showMessage('error', data.error || 'Failed to save missions')
      }
    } catch (error) {
      console.error('Error saving missions:', error)
      showMessage('error', 'Failed to save missions')
    } finally {
      setSaving(false)
    }
  }

  const fetchFromStatsFM = async () => {
    // Placeholder for Stats.fm integration
    showMessage('error', 'Stats.fm integration not yet implemented')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Missions Admin</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Song Library Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Song Library</h2>
          
          {/* Add New Song Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Song</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Track ID"
                value={newSongId}
                onChange={(e) => setNewSongId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Track Name"
                value={newSongName}
                onChange={(e) => setNewSongName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Artist (optional)"
                value={newSongArtist}
                onChange={(e) => setNewSongArtist(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addSongToLibrary}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Song
              </button>
            </div>
          </div>

          {/* Song List */}
          <div className="space-y-2">
            {songs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No songs in library yet</p>
            ) : (
              songs.map((song) => (
                <div key={song.trackId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">{song.trackName}</p>
                    <p className="text-sm text-gray-600">
                      ID: {song.trackId} {song.artist && `• ${song.artist}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Current Missions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Missions</h2>
            <div className="flex gap-2">
              <button
                onClick={fetchFromStatsFM}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Fetch from Stats.fm
              </button>
              <button
                onClick={addMission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add Mission
              </button>
            </div>
          </div>

          {/* Mission List */}
          <div className="space-y-4">
            {missions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No missions yet. Click "Add Mission" to create one.</p>
            ) : (
              missions.map((mission) => (
                <div key={mission.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Song Selection */}
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Song
                      </label>
                      {mission.trackId ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div>
                            <p className="font-medium text-gray-900">{mission.trackName}</p>
                            <p className="text-sm text-gray-600">ID: {mission.trackId}</p>
                          </div>
                          <button
                            onClick={() => updateMission(mission.id, 'trackId', 0)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => {
                            const song = songs.find(s => s.trackId === parseInt(e.target.value))
                            if (song) selectSongForMission(mission.id, song)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a song...</option>
                          {songs.map((song) => (
                            <option key={song.trackId} value={song.trackId}>
                              {song.trackName} {song.artist && `- ${song.artist}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Target */}
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Streams
                      </label>
                      <input
                        type="number"
                        value={mission.target}
                        onChange={(e) => updateMission(mission.id, 'target', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-2 flex items-end">
                      <button
                        onClick={() => removeMission(mission.id)}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Save Button */}
          {missions.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveMissions}
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Missions'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}