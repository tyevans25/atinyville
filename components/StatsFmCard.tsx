"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Check, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export default function StatsFmCard() {
  const { isSignedIn, user } = useUser()
  const [statsfmUsername, setStatsfmUsername] = useState("")
  const [savedUsername, setSavedUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Fetch existing username on load
  useEffect(() => {
    if (isSignedIn) {
      fetchUsername()
    }
  }, [isSignedIn])

  const fetchUsername = async () => {
    try {
      const response = await fetch('/api/statsfm/username')
      const data = await response.json()
      if (data.statsfmUsername) {
        setSavedUsername(data.statsfmUsername)
      }
    } catch (error) {
      console.error('Error fetching username:', error)
    }
  }

  const handleSave = async () => {
    if (!statsfmUsername.trim()) {
      setError('Please enter a username')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/statsfm/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statsfmUsername: statsfmUsername.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save username')
        setLoading(false)
        return
      }

      setSavedUsername(data.username)
      setSuccess(true)
      setStatsfmUsername('')
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    // TODO: Add remove functionality if needed
    setSavedUsername(null)
  }

  if (!isSignedIn) {
    return (
      <Card className="glass-card">
        <CardHeader className="glass-header-blue text-white">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Track Your Streams
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-300 text-center">
            Sign in to add your stats.fm username and track your contributions!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader className="glass-header-blue text-white">
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5" />
          Track Your Streams
        </CardTitle>
        <CardDescription className="text-gray-300">
          Add your stats.fm username to automatically track your daily streams
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {savedUsername ? (
          // Already saved
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-semibold">Connected!</p>
                <p className="text-sm text-gray-300">@{savedUsername}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Your streams are being tracked automatically. Check the daily goal to see your contribution!
            </p>
            {// Add remove button
            <Button 
              variant="outline" 
              className="w-full border-white/20 text-gray-300 hover:bg-white/10"
              onClick={handleRemove}
            >
              Remove Username
            </Button>
            }
          </div>
        ) : (
          // Not saved yet
          <>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Your stats.fm username:
              </label>
              <input
                type="text"
                value={statsfmUsername}
                onChange={(e) => setStatsfmUsername(e.target.value)}
                placeholder="username"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Saved successfully!
                </p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                💡 Make sure your stats.fm profile is <span className="text-white font-semibold">public</span> so we can track your streams!
              </p>
            </div>

            <Button 
              onClick={handleSave}
              disabled={loading || !statsfmUsername.trim()}
              className="w-full bg-white hover:bg-gray-200 text-gray-800"
              size="lg"
            >
              {loading ? 'Saving...' : 'Save Username'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
