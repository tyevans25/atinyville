'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, TrendingUp } from 'lucide-react'

interface Song {
  trackId: number
  trackName: string
  artist?: string
  addedAt: string
}

interface DailyGoal {
  song: string
  target: number
  current: number
  userStreams: number
}

export default function DailyGoalAdmin() {
  const [songs, setSongs] = useState<Song[]>([])
  const [currentGoal, setCurrentGoal] = useState<DailyGoal | null>(null)
  const [selectedSong, setSelectedSong] = useState('')
  const [target, setTarget] = useState(1000)
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

      // Fetch current daily goal
      const goalRes = await fetch('/api/daily-goal')
      if (goalRes.ok) {
        const goalData = await goalRes.json()
        if (goalData) {
          setCurrentGoal(goalData)
          setSelectedSong(goalData.song)
          setTarget(goalData.target)
        }
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

  const saveDailyGoal = async () => {
    if (!selectedSong || !target) {
      showMessage('error', 'Please select a song and set a target')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/daily-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          song: selectedSong,
          target: target
        })
      })

      const data = await res.json()

      if (res.ok) {
        showMessage('success', `Daily goal saved for ${data.date}`)
        setCurrentGoal({
          song: data.song,
          target: data.target,
          current: data.current,
          userStreams: 0
        })
      } else {
        showMessage('error', data.error || 'Failed to save daily goal')
      }
    } catch (error) {
      console.error('Error saving daily goal:', error)
      showMessage('error', 'Failed to save daily goal')
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Daily Goal Admin</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Current Goal Status */}
        {currentGoal && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Daily Goal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-1">Song</p>
                <p className="text-lg font-semibold text-gray-900">{currentGoal.song}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium mb-1">Target</p>
                <p className="text-lg font-semibold text-gray-900">{currentGoal.target.toLocaleString()} streams</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-1">Current Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentGoal.current.toLocaleString()} / {currentGoal.target.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((currentGoal.current / currentGoal.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Song to Library */}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Song
              </button>
            </div>
          </div>

          {/* Song List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {songs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No songs in library yet</p>
            ) : (
              songs.map((song) => (
                <div key={song.trackId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
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

        {/* Set Daily Goal */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Set Today's Daily Goal</h2>
            <button
              onClick={fetchFromStatsFM}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Fetch from Stats.fm
            </button>
          </div>

          <div className="space-y-4">
            {/* Song Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Song
              </label>
              <select
                value={selectedSong}
                onChange={(e) => setSelectedSong(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a song...</option>
                {songs.map((song) => (
                  <option key={song.trackId} value={song.trackName}>
                    {song.trackName} {song.artist && `- ${song.artist}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Streams
              </label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                step="100"
              />
            </div>

            {/* Quick Target Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Targets
              </label>
              <div className="flex gap-2 flex-wrap">
                {[500, 1000, 2000, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTarget(preset)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      target === preset
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedSong && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-blue-600" size={20} />
                  <h3 className="font-medium text-blue-900">Goal Preview</h3>
                </div>
                <p className="text-gray-700">
                  Stream <span className="font-semibold">{selectedSong}</span> {target.toLocaleString()} times today
                </p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={saveDailyGoal}
                disabled={saving || !selectedSong}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Daily Goal'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}