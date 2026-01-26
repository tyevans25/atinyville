"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

interface Mission {
  id: string
  song: string
  target: number
}

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([
    { id: "1", song: "", target: 2 }
  ])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const addMission = () => {
    const newId = String(missions.length + 1)
    setMissions([...missions, { id: newId, song: "", target: 2 }])
  }

  const removeMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id))
  }

  const updateMission = (id: string, field: 'song' | 'target', value: string | number) => {
    setMissions(missions.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const setMissionsForToday = async () => {
    // Validate
    for (const mission of missions) {
      if (!mission.song || mission.song.trim() === "") {
        setResult("❌ All missions must have a song name")
        return
      }
      if (mission.target < 1 || mission.target > 10) {
        setResult("❌ Target must be between 1 and 10")
        return
      }
    }

    setLoading(true)
    setResult("")

    try {
      const response = await fetch('/api/daily-missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missions })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Successfully set ${missions.length} missions for today!`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult("❌ Failed to set missions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle>Set Daily Missions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-300">
              Create individual streaming missions for users. Each user must complete these on their own.
            </p>

            {/* Missions List */}
            <div className="space-y-3">
              {missions.map((mission, index) => (
                <div key={mission.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold w-8">#{index + 1}</span>
                    
                    <input
                      type="text"
                      placeholder="Song name (e.g., WORK)"
                      value={mission.song}
                      onChange={(e) => updateMission(mission.id, 'song', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500"
                    />

                    <select
                      value={mission.target}
                      onChange={(e) => updateMission(mission.id, 'target', Number(e.target.value))}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'time' : 'times'}</option>
                      ))}
                    </select>

                    {missions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMission(mission.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Mission Button */}
            {missions.length < 10 && (
              <Button
                variant="outline"
                onClick={addMission}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Mission
              </Button>
            )}

            {/* Submit Button */}
            <Button
              onClick={setMissionsForToday}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
              size="lg"
            >
              {loading ? 'Setting Missions...' : 'Set Missions for Today'}
            </Button>

            {/* Result Message */}
            {result && (
              <div className={`p-4 rounded-lg ${
                result.includes('✅') 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {result}
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>How it works:</strong> Each user sees these missions on their Streaming Hub. 
                The missions track how many times THEY personally streamed each song today. 
                Missions reset at midnight.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}