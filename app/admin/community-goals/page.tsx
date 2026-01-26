"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminCommunityGoals() {
  const [dailyTarget, setDailyTarget] = useState(10000)
  const [weeklyTarget, setWeeklyTarget] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const setDailyGoal = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch('/api/community-daily-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: dailyTarget })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Daily community goal set: ${dailyTarget.toLocaleString()} total ATEEZ streams`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult("❌ Failed to set daily goal")
    } finally {
      setLoading(false)
    }
  }

  const setWeeklyGoal = async () => {
    setLoading(true)
    setResult("")

    try {
      const response = await fetch('/api/community-weekly-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: weeklyTarget })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Weekly community goal set: ${weeklyTarget.toLocaleString()} total ATEEZ streams`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult("❌ Failed to set weekly goal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community Goals Admin</h1>
          <p className="text-gray-400">Set total ATEEZ streaming goals for the community</p>
        </div>

        {/* Daily Community Goal */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle>Daily Community Goal</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-300 text-sm">
              Track combined streams from ALL ATINYs for ANY ATEEZ song. Resets daily at midnight.
            </p>

            <div>
              <label className="text-white text-sm font-semibold mb-2 block">
                Target Total ATEEZ Streams
              </label>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold"
                placeholder="10000"
                min="1"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Example: 10,000 means the community needs 10,000 combined ATEEZ streams today
              </p>
            </div>

            <Button
              onClick={setDailyGoal}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
              size="lg"
            >
              {loading ? 'Setting...' : 'Set Daily Community Goal'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>This tracks ANY ATEEZ song</strong> streamed by any user with stats.fm linked. 
                It's different from the song-specific goal on the homepage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Community Goal */}
        <Card className="glass-card">
          <CardHeader className="glass-header-blue text-white">
            <CardTitle>Weekly Community Goal</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-gray-300 text-sm">
              Track combined streams from ALL ATINYs for ANY ATEEZ song. Resets weekly on Sunday.
            </p>

            <div>
              <label className="text-white text-sm font-semibold mb-2 block">
                Target Total ATEEZ Streams
              </label>
              <input
                type="number"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-lg font-bold"
                placeholder="50000"
                min="1"
                step="1000"
              />
              <p className="text-xs text-gray-400 mt-1">
                Example: 50,000 means the community needs 50,000 combined ATEEZ streams this week
              </p>
            </div>

            <Button
              onClick={setWeeklyGoal}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
              size="lg"
            >
              {loading ? 'Setting...' : 'Set Weekly Community Goal'}
            </Button>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Week runs Monday-Sunday.</strong> This tracks ANY ATEEZ song streamed 
                by any user with stats.fm linked.
              </p>
            </div>
          </CardContent>
        </Card>

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

        {/* Quick Reference */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-3">📝 Goal Types Reference</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white/5 rounded p-3">
                <p className="text-white font-semibold">Homepage Goal (Song-Specific)</p>
                <p className="text-gray-400">Admin at: <code>/admin/goal</code></p>
                <p className="text-gray-400">Example: "Stream WORK 500 times"</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <p className="text-white font-semibold">Community Goals (Total ATEEZ)</p>
                <p className="text-gray-400">Admin at: <code>/admin/community-goals</code> (this page)</p>
                <p className="text-gray-400">Example: "Stream ANY ATEEZ song 10,000 times"</p>
              </div>
              <div className="bg-white/5 rounded p-3">
                <p className="text-white font-semibold">Individual Missions</p>
                <p className="text-gray-400">Admin at: <code>/admin/missions</code></p>
                <p className="text-gray-400">Example: "Stream WORK 2 times" (per user)</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}