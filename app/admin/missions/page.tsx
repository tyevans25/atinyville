'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Mission {
  id: string
  song: string
  target: number
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [newSong, setNewSong] = useState('')
  const [newTarget, setNewTarget] = useState('1')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSong, setEditSong] = useState('')
  const [editTarget, setEditTarget] = useState('')

  useEffect(() => {
    fetchMissions()
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

  const addMission = () => {
    if (!newSong.trim() || !newTarget) return

    const mission: Mission = {
      id: newSong.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      song: newSong.trim(),
      target: parseInt(newTarget)
    }

    setMissions([...missions, mission])
    setNewSong('')
    setNewTarget('1')
  }

  const startEdit = (mission: Mission) => {
    setEditingId(mission.id)
    setEditSong(mission.song)
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
          id: editSong.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          song: editSong.trim(),
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
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300 mb-2 block">
                  Song Name (case-sensitive, must match stats.fm exactly)
                </label>
                <input
                  type="text"
                  placeholder="BOUNCY (K-HOT CHILLI PEPPERS)"
                  value={newSong}
                  onChange={(e) => setNewSong(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Check Recent Tracks to see exact song names
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
              disabled={!newSong.trim() || !newTarget}
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
                          ⚠️ Changing the song name will reset progress for this mission
                        </p>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">
                            Stream &quot;{mission.song}&quot;
                          </p>
                          <p className="text-sm text-gray-400">
                            Target: {mission.target} {mission.target === 1 ? 'stream' : 'streams'}
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
              <li>• Missions are personal to each user</li>
              <li>• Progress updates every 30 minutes when cron runs</li>
              <li>• Song names must match stats.fm exactly (case-sensitive)</li>
              <li>• Missions automatically expire at midnight KST</li>
              <li>• Editing song names resets progress for that mission</li>
              <li>• Editing target numbers keeps existing progress</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}