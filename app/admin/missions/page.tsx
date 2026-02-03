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
  
  // Catalog state
  const [catalog, setCatalog] = useState<CatalogSong[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSongs, setFilteredSongs] = useState<CatalogSong[]>([])
  
  // Manual add state
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualTrackId, setManualTrackId] = useState('')
  const [manualTrackName, setManualTrackName] = useState('')
  const [manualAlbumId, setManualAlbumId] = useState('')

  useEffect(() => {
    fetchMissions()
    fetchCatalog()
  }, [])

  useEffect(() => {
    // Filter songs based on input
    if (newSong.trim() === '') {
      setFilteredSongs(catalog)
    } else {
      const filtered = catalog.filter(s => 
        s.trackName.toLowerCase().includes(newSong.toLowerCase())
      )
      setFilteredSongs(filtered)
    }
  }, [newSong, catalog])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.song-dropdown-container')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/daily-missions')
      const data = await res.json()
      setMissions(data.missions || [])
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
        setTimeout(() => setMessage(''), 3000)
        await fetchCatalog()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to sync catalog')
    } finally {
      setLoadingCatalog(false)
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
            albumId: manualAlbumId ? parseInt(manualAlbumId) : undefined
          }],
          source: 'manual'
        })
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setMessage(`✅ Added "${manualTrackName}" to catalog (${data.total} total songs)`)
        setTimeout(() => setMessage(''), 3000)
        setManualTrackId('')
        setManualTrackName('')
        setManualAlbumId('')
        setShowManualAdd(false)
        await fetchCatalog() // Refresh the catalog
      } else {
        setMessage(`❌ ${data.error || 'Failed to add song'}`)
      }
    } catch (error) {
      console.error('Error adding song:', error)
      setMessage('❌ Failed to add song')
    }
  }

  const selectSong = (song: CatalogSong) => {
    setNewSong(song.trackName)
    setNewTrackId(song.trackId)
    setShowDropdown(false)
  }

  const addMission = () => {
    if (!newSong.trim() || !newTarget || !newTrackId) {
      setMessage('❌ Please select a song from the catalog')
      return
    }

    const mission: Mission = {
      id: `${newTrackId}`,
      trackId: newTrackId,
      trackName: newSong.trim(),
      target: parseInt(newTarget)
    }

    setMissions([...missions, mission])
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

  const saveEdit = (oldId: string) => {
    const updatedMissions = missions.map(m => {
      if (m.id === oldId) {
        return {
          ...m,
          trackName: editSong.trim(),
          target: parseInt(editTarget)
        }
      }
      return m
    })
    setMissions(updatedMissions)
    cancelEdit()
  }

  const deleteMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id))
  }

  const saveMissions = async () => {
    if (missions.length === 0) {
      setMessage('Please add at least one mission')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/daily-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ ${missions.length} mission(s) set successfully!`)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to save missions')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    if (confirm('Clear all missions? This will remove them from the list (but not from the database until you save).')) {
      setMissions([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin: Daily Missions</h1>
          <p className="text-gray-400">
            Set daily missions for individual users. Missions reset automatically at midnight KST.
          </p>
        </div>

        {/* Info Card */}
        <Card className="glass-card border-blue-500/50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Auto-Default:</strong> If you don&apos;t set new missions, yesterday&apos;s missions will automatically carry over. 
              Great for consistent daily tracking!
            </p>
          </CardContent>
        </Card>

        {/* Song Catalog Management */}
        <Card className="glass-card border-purple-500/50">
          <CardHeader className="glass-header-blue text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Song Catalog ({catalog.length} songs)
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={syncCatalog}
                  disabled={loadingCatalog}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {loadingCatalog ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Sync from stats.fm
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowManualAdd(!showManualAdd)}
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Song Manually
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showManualAdd && (
            <CardContent className="p-6 bg-white/5 border-t border-white/10">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Track ID (Required)
                  </label>
                  <input
                    type="number"
                    placeholder="274148441"
                    value={manualTrackId}
                    onChange={(e) => setManualTrackId(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Song Name (Required)
                  </label>
                  <input
                    type="text"
                    placeholder="WORK"
                    value={manualTrackName}
                    onChange={(e) => setManualTrackName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Album ID (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="26772323"
                    value={manualAlbumId}
                    onChange={(e) => setManualAlbumId(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={addManualSong}
                  disabled={!manualTrackId || !manualTrackName}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Catalog
                </Button>
                <Button
                  onClick={() => setShowManualAdd(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                💡 Find track IDs at open.spotify.com - it's in the URL!
              </p>
            </CardContent>
          )}
        </Card>

        {/* Add New Mission */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 song-dropdown-container relative">
                <label className="text-sm text-gray-300 mb-2 block">
                  Song Name (from catalog)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search catalog..."
                    value={newSong}
                    onChange={(e) => {
                      setNewSong(e.target.value)
                      setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-2 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Dropdown */}
                {showDropdown && filteredSongs.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredSongs.map((song) => (
                      <button
                        key={song.trackId}
                        type="button"
                        onClick={() => selectSong(song)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="block truncate">{song.trackName}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {song.source === 'manual' ? '✋' : '🤖'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {showDropdown && filteredSongs.length === 0 && newSong.trim() !== '' && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-xl p-4">
                    <p className="text-gray-400 text-sm">No matching songs in catalog</p>
                    <p className="text-gray-500 text-xs mt-1">Add it manually or sync from stats.fm</p>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  💡 {catalog.length} songs in catalog • 🤖 = auto • ✋ = manual
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">
                  Target Streams
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button
              onClick={addMission}
              disabled={!newSong.trim() || !newTarget || !newTrackId}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to List
            </Button>
          </CardContent>
        </Card>

        {/* Current Missions List */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <div className="flex items-center justify-between">
              <CardTitle>Missions List ({missions.length})</CardTitle>
              {missions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {missions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No missions added yet. Add missions above.
              </p>
            ) : (
              <div className="space-y-3">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    {editingId === mission.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              value={editSong}
                              onChange={(e) => setEditSong(e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              value={editTarget}
                              onChange={(e) => setEditTarget(e.target.value)}
                              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(mission.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                        <p className="text-xs text-yellow-400">
                          ⚠️ Editing only changes display name, track ID stays the same
                        </p>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            Stream &quot;{mission.trackName}&quot;
                          </p>
                          <p className="text-sm text-gray-400">
                            Target: {mission.target} {mission.target === 1 ? 'stream' : 'streams'} • ID: {mission.trackId}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(mission)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMission(mission.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        {missions.length > 0 && (
          <Card className="glass-card border-green-500/50">
            <CardContent className="p-6">
              <Button
                onClick={saveMissions}
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="lg"
              >
                {loading ? 'Saving...' : `💾 Save ${missions.length} Mission(s) to Database`}
              </Button>
              {message && (
                <p className={`text-center mt-4 ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-2">ℹ️ How Missions Work</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Missions use track IDs for perfect matching</li>
              <li>• Catalog auto-syncs from your stats.fm streams</li>
              <li>• Manually add songs not in your recent history</li>
              <li>• Progress updates every 30 minutes when cron runs</li>
              <li>• Missions automatically expire at midnight KST</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}