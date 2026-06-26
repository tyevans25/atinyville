'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, CheckCircle, XCircle, RotateCcw, Youtube, X } from 'lucide-react'
import { triggerCronJob } from './actions'

export default function AdminCronTrigger() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)
  const [focusUrl, setFocusUrl] = useState('')
  const [focusGoal24, setFocusGoal24] = useState('')
  const [focusGoal48, setFocusGoal48] = useState('')
  const [focusGoal72, setFocusGoal72] = useState('')
  const [focusTrendingGoal, setFocusTrendingGoal] = useState('')
  const [focusLoading, setFocusLoading] = useState(false)
  const [focusMsg, setFocusMsg] = useState<string | null>(null)
  const [focusError, setFocusError] = useState<string | null>(null)
  const [currentFocus, setCurrentFocus] = useState<any>(null)
  const [goalEdit24, setGoalEdit24] = useState('')
  const [goalEdit48, setGoalEdit48] = useState('')
  const [goalEdit72, setGoalEdit72] = useState('')
  const [goalEditTrending, setGoalEditTrending] = useState('')
  const [goalLoading, setGoalLoading] = useState(false)

  useEffect(() => {
    fetch('/api/focus-mv').then(r => r.json()).then(d => {
      const f = d.focus || null
      setCurrentFocus(f)
      if (f) {
        setGoalEdit24(f.goal24h ? (f.goal24h / 1_000_000).toFixed(1) + 'M' : '')
        setGoalEdit48(f.goal48h ? (f.goal48h / 1_000_000).toFixed(1) + 'M' : '')
        setGoalEdit72(f.goal72h ? (f.goal72h / 1_000_000).toFixed(1) + 'M' : '')
        setGoalEditTrending(f.trendingGoal ? String(f.trendingGoal) : '')
      }
    }).catch(() => {})
  }, [])

  const handleUpdateGoals = async () => {
    setGoalLoading(true)
    setFocusMsg(null)
    setFocusError(null)
    const parseViews = (s: string) => s
      ? Number(s.replace(/[^0-9.]/g, '')) * (s.toLowerCase().includes('m') ? 1_000_000 : s.toLowerCase().includes('k') ? 1_000 : 1)
      : null
    try {
      const res = await fetch('/api/focus-mv', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal24h: parseViews(goalEdit24),
          goal48h: parseViews(goalEdit48),
          goal72h: parseViews(goalEdit72),
          trendingGoal: goalEditTrending ? Number(goalEditTrending) : null,
        }),
      })
      const data = await res.json()
      if (res.ok) { setFocusMsg('✅ Goals updated!'); setCurrentFocus(data.focus) }
      else setFocusError(data.error || 'Failed to update goals')
    } catch { setFocusError('Network error') }
    finally { setGoalLoading(false) }
  }

  const handleTrigger = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await triggerCronJob()
      
      if (!response.success) {
        setError(response.error || 'Failed to trigger cron')
        return
      }

      setResult(response.data)

    } catch (err) {
      console.error('Error triggering cron:', err)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResetMissions = async () => {
    setResetLoading(true)
    setResetMsg(null)
    try {
      const res = await fetch('/api/admin/reset-missions', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResetMsg(data.message)
      } else {
        setResetMsg(data.error || 'Failed to clear missions')
      }
    } catch {
      setResetMsg('Error clearing missions')
    } finally {
      setResetLoading(false)
    }
  }

  const handleSetFocus = async () => {
    if (!focusUrl.trim()) return
    setFocusLoading(true)
    setFocusMsg(null)
    setFocusError(null)
    try {
      const res = await fetch('/api/focus-mv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: focusUrl.trim(),
          ...(focusGoal24 ? { goal24h: Number(focusGoal24.replace(/[^0-9.]/g, '')) * (focusGoal24.toLowerCase().includes('m') ? 1_000_000 : focusGoal24.toLowerCase().includes('k') ? 1_000 : 1) } : {}),
          ...(focusGoal48 ? { goal48h: Number(focusGoal48.replace(/[^0-9.]/g, '')) * (focusGoal48.toLowerCase().includes('m') ? 1_000_000 : focusGoal48.toLowerCase().includes('k') ? 1_000 : 1) } : {}),
          ...(focusGoal72 ? { goal72h: Number(focusGoal72.replace(/[^0-9.]/g, '')) * (focusGoal72.toLowerCase().includes('m') ? 1_000_000 : focusGoal72.toLowerCase().includes('k') ? 1_000 : 1) } : {}),
          ...(focusTrendingGoal ? { trendingGoal: Number(focusTrendingGoal) } : {}),
        })
      })
      const data = await res.json()
      if (res.ok) {
        setFocusMsg(`✅ Focus MV set: "${data.focus.title}"`)
        setFocusUrl('')
        setCurrentFocus(data.focus)
      } else {
        setFocusError(data.error || 'Failed to set focus MV')
      }
    } catch {
      setFocusError('Network error')
    } finally {
      setFocusLoading(false)
    }
  }

  const handleClearFocus = async () => {
    setFocusLoading(true)
    setFocusMsg(null)
    setFocusError(null)
    try {
      const res = await fetch('/api/focus-mv', { method: 'DELETE' })
      if (res.ok) { setFocusMsg('Focus MV cleared.'); setCurrentFocus(null) }
      else setFocusError('Failed to clear')
    } catch {
      setFocusError('Network error')
    } finally {
      setFocusLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin: Manual Cron Trigger</h1>
      <p className="text-gray-600">
        Manually trigger the stream counting cron job. Normally runs every 30 minutes automatically.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Trigger Cron Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTrigger}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Cron...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Trigger Cron Now
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Cron Completed Successfully!</p>
                  <p className="text-sm text-green-700">Stream counts have been updated</p>
                </div>
              </div>

              <div className="bg-white rounded border border-green-200 p-3 text-sm space-y-1">
                <p><span className="font-semibold">Users Processed:</span> {result.usersProcessed}</p>
                <p><span className="font-semibold">New Daily Streams (Any ATEEZ):</span> +{result.newDailyStreams}</p>
                <p><span className="font-semibold">New Daily Song Streams:</span> +{result.newDailySongStreams}</p>
                <p><span className="font-semibold">New Weekly Streams:</span> +{result.newWeeklyStreams}</p>
                <p><span className="font-semibold">Missions Count:</span> {result.missionsCount}</p>
                <p className="text-xs text-gray-500 pt-2">{result.timestamp}</p>
              </div>

              <p className="text-xs text-gray-600">
                💡 Refresh the streaming page to see updated community goals!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            Focus MV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Set a YouTube MV to track hourly views. The chart will appear above the calendar on the home page.
          </p>

          {/* Current focus MV state */}
          {currentFocus ? (
            <div className="bg-gray-50 border rounded-lg p-3 text-sm space-y-1">
              <p className="font-semibold text-gray-800 truncate">▶ {currentFocus.title}</p>
              <p className="text-gray-500 font-mono text-xs">{currentFocus.videoId}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentFocus.goal24h ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                  24h goal: {currentFocus.goal24h ? `${(currentFocus.goal24h / 1_000_000).toFixed(1)}M` : 'not set'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentFocus.goal72h ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                  72h goal: {currentFocus.goal72h ? `${(currentFocus.goal72h / 1_000_000).toFixed(1)}M` : 'not set'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentFocus.trendingGoal ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                  trending goal: {currentFocus.trendingGoal ? `Top ${currentFocus.trendingGoal}` : 'not set'}
                </span>
              </div>
              {/* Inline goal editor */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <input type="text" value={goalEdit24} onChange={e => setGoalEdit24(e.target.value)} placeholder="24h e.g. 10M"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
                <input type="text" value={goalEdit48} onChange={e => setGoalEdit48(e.target.value)} placeholder="48h e.g. 15M"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input type="text" value={goalEdit72} onChange={e => setGoalEdit72(e.target.value)} placeholder="72h e.g. 20M"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400" />
                <input type="number" value={goalEditTrending} onChange={e => setGoalEditTrending(e.target.value)} placeholder="Trend rank"
                  className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
              <Button size="sm" disabled={goalLoading} onClick={handleUpdateGoals} className="w-full mt-1">
                {goalLoading ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
                Update Goals
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No focus MV currently set.</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={focusUrl}
              onChange={e => setFocusUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetFocus()}
              placeholder="YouTube URL or video ID"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Button onClick={handleSetFocus} disabled={focusLoading || !focusUrl.trim()} size="sm">
              {focusLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Set'}
            </Button>
            <Button onClick={handleClearFocus} disabled={focusLoading} size="sm" variant="outline">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">24h View Goal</label>
              <input type="text" value={focusGoal24} onChange={e => setFocusGoal24(e.target.value)} placeholder="e.g. 10M"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">48h View Goal</label>
              <input type="text" value={focusGoal48} onChange={e => setFocusGoal48(e.target.value)} placeholder="e.g. 15M"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">72h View Goal</label>
              <input type="text" value={focusGoal72} onChange={e => setFocusGoal72(e.target.value)} placeholder="e.g. 20M"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Trending Goal (rank)</label>
              <input type="number" value={focusTrendingGoal} onChange={e => setFocusTrendingGoal(e.target.value)} placeholder="e.g. 10"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          {focusMsg && <p className="text-sm text-gray-700 bg-gray-50 border rounded p-3">{focusMsg}</p>}
          {focusError && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{focusError}</p>}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-400 mb-2">Preview mode — fills 48h of fake history + demo goals so you can see the full card layout. <strong className="text-orange-500">Dev only.</strong></p>
            {process.env.NODE_ENV !== 'production' && (
            <Button
              size="sm" variant="outline"
              className="text-xs text-gray-500"
              onClick={async () => {
                const r = await fetch('/api/admin/seed-focus-test', { method: 'POST' })
                const d = await r.json()
                if (r.ok) setFocusMsg(`🧪 Demo data seeded (${d.entries} entries). Refresh the home page.`)
                else setFocusError(d.error || 'Seed failed')
              }}
            >
              Seed Demo Data
            </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Mission Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Clear today's missions so the next cron run auto-generates them from your title track settings.
          </p>
          <Button onClick={handleResetMissions} disabled={resetLoading} variant="outline" className="w-full">
            {resetLoading ? <><RotateCcw className="w-4 h-4 mr-2 animate-spin" />Clearing...</> : <><RotateCcw className="w-4 h-4 mr-2" />Clear Today's Missions</>}
          </Button>
          {resetMsg && <p className="text-sm text-gray-700 bg-gray-50 border rounded p-3">{resetMsg}</p>}
          {resetMsg && !resetMsg.includes('Error') && (
            <p className="text-xs text-gray-500">Now click "Trigger Cron Now" above to regenerate missions from your title tracks.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">⚠️ Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• This manually triggers the same job that runs every 30 minutes</p>
          <p>• Make sure goals are set before running (use /admin/goal, etc.)</p>
          <p>• The cron won't double-count - it tracks the last processed timestamp per user</p>
          <p>• Community goals will update immediately after running this</p>
        </CardContent>
      </Card>
    </div>
  )
}