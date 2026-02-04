"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, ChevronDown, RefreshCw, Plus, Database, X } from "lucide-react"

interface CatalogSong {
  trackId: number
  trackName: string
  albumId?: number
  addedAt: string
  source: 'auto' | 'manual'
}

export default function AdminDailySongGoalPage() {
  const [selectedSong, setSelectedSong] = useState('')
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [target, setTarget] = useState(5000)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
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
    fetchCatalog()
  }, [])

  useEffect(() => {
    // Filter songs based on input
    if (selectedSong.trim() === '') {
      setFilteredSongs(catalog)
    } else {
      const filtered = catalog.filter(s => 
        s.trackName.toLowerCase().includes(selectedSong.toLowerCase())
      )
      setFilteredSongs(filtered)
    }
  }, [selectedSong, catalog])

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
        await fetchCatalog()
      } else {
        setMessage(`❌ ${data.error || 'Failed to add song'}`)
      }
    } catch (error) {
      console.error('Error adding song:', error)
      setMessage('❌ Failed to add song')
    }
  }

  const selectSong = (song: CatalogSong) => {
    setSelectedSong(song.trackName)
    setSelectedTrackId(song.trackId)
    setShowDropdown(false)
  }

  const setGoal = async () => {
    if (!selectedSong.trim() || !target || !selectedTrackId) {
      setMessage('❌ Please select a song from the catalog')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/daily-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          song: selectedSong,
          trackId: selectedTrackId,  // ← Add this!
          target 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`✅ Daily song goal set: Stream "${selectedSong}" ${target.toLocaleString()} times`)
      } else {
        setMessage(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Failed to set goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin: Daily Song Goal</h1>
          <p className="text-gray-400">
            Set the song-specific daily goal for the homepage. Resets at midnight KST.
          </p>
        </div>

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
                💡 Find track IDs at open.spotify.com - it&apos;s in the URL!
              </p>
            </CardContent>
          )}
        </Card>

        {/* Set Daily Song Goal */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Set Daily Song Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="song-dropdown-container relative">
                <label className="text-sm text-gray-300 mb-2 block">
                  Song Name (from catalog)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search catalog..."
                    value={selectedSong}
                    onChange={(e) => {
                      setSelectedSong(e.target.value)
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
                
                {showDropdown && filteredSongs.length === 0 && selectedSong.trim() !== '' && (
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
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="1"
                  step="100"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Total streams needed for this song today
                </p>
              </div>
            </div>

            <Button
              onClick={setGoal}
              disabled={loading || !selectedSong.trim() || !target || !selectedTrackId}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
              size="lg"
            >
              {loading ? 'Setting...' : '💾 Set Daily Song Goal'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>This goal appears on the homepage.</strong> It tracks streams of ONE specific 
                song by all users. Resets at midnight KST.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Result Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Info */}
        <Card className="glass-card border-blue-500/50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-300">
              💡 <strong>Auto-Default:</strong> If you don&apos;t set a new song goal, yesterday&apos;s song will automatically continue. 
              Perfect for comeback season - set it once and it keeps going!
            </p>
          </CardContent>
        </Card>

        {/* Original Info */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-2">ℹ️ About This Goal</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• This is the main goal displayed on the homepage</li>
              <li>• Tracks ONE specific song across all users</li>
              <li>• Uses track ID for perfect matching (no typos!)</li>
              <li>• Automatically resets at midnight KST</li>
              <li>• Progress updates every 30 minutes when cron runs</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}