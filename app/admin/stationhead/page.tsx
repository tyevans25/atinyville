'use client'

import { useState, useEffect } from 'react'
import { Radio, ExternalLink } from 'lucide-react'

const STATIONS = [
  { username: 'ateez',            displayName: 'ATEEZ Official' },
  { username: 'bluebirdfm',       displayName: 'BlueBird FM' },
  { username: '9024fm',           displayName: '9024FM' },
  { username: '1117am',           displayName: '1117AM' },
  { username: 'ateezdimension',   displayName: 'Ateez Dimension' },
  { username: 'barangay1117',     displayName: 'Barangay 1117' },
  { username: 'jtinystation',     displayName: 'Jtiny Station' },
  { username: 'cracktiny',        displayName: 'Cracktiny' },
  { username: 'djbluebird1117',   displayName: 'DJ Bluebird' },
  { username: 'djkraken',         displayName: 'DJ Kraken' },
  { username: 'atinymovementarg', displayName: 'ATINY Movement ARG' },
  { username: 'argentinyfm',      displayName: 'Argentiny FM' },
  { username: 'ateezlatam',       displayName: 'ATEEZ Latam' },
  { username: 'startinyarg',      displayName: 'Startiny ARG' },
]

export default function StationheadAdminPage() {
  const [liveSet, setLiveSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stationhead-live')
      .then(r => r.json())
      .then(d => {
        setLiveSet(new Set(d.live || []))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggle = async (username: string) => {
    const nowLive = !liveSet.has(username)
    setToggling(username)
    try {
      const res = await fetch('/api/admin/stationhead-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, live: nowLive }),
      })
      if (res.ok) {
        setLiveSet(prev => {
          const next = new Set(prev)
          nowLive ? next.add(username) : next.delete(username)
          return next
        })
      }
    } finally {
      setToggling(null)
    }
  }

  const liveCount = liveSet.size

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Radio className="w-7 h-7 text-red-500" />
          Stationhead Live Status
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Toggle stations on air manually. Live status auto-expires after 4 hours.
        </p>
      </div>

      {/* Summary bar */}
      <div className={`rounded-xl px-5 py-4 border flex items-center gap-3 ${
        liveCount > 0
          ? 'bg-red-50 border-red-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          liveCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
        }`} />
        <p className={`font-semibold text-sm ${liveCount > 0 ? 'text-red-800' : 'text-gray-500'}`}>
          {liveCount > 0
            ? `${liveCount} station${liveCount > 1 ? 's' : ''} currently ON AIR`
            : 'No stations currently live'}
        </p>
      </div>

      {/* Station list */}
      <div className="border rounded-xl overflow-hidden divide-y">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          STATIONS.map(station => {
            const isLive = liveSet.has(station.username)
            const isToggling = toggling === station.username
            return (
              <div key={station.username} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {isLive && (
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                  )}
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${isLive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {station.displayName}
                    </p>
                    <a
                      href={`https://www.stationhead.com/${station.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-blue-500 flex items-center gap-1 w-fit"
                      onClick={e => e.stopPropagation()}
                    >
                      @{station.username}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => toggle(station.username)}
                  disabled={isToggling}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
                    isLive ? 'bg-red-500 border-red-500' : 'bg-gray-200 border-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                      isLive ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            )
          })
        )}
      </div>

      <p className="text-xs text-gray-400">
        Live status expires automatically after 4 hours — turn off manually when the party ends to keep the banner accurate.
      </p>
    </div>
  )
}
