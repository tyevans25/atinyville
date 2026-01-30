"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Radio, Sparkles, ExternalLink, TrendingUp } from "lucide-react"
import Navigation from "@/components/Navigation"
import StatsFmCard from "@/components/StatsFmCard"
import DailyMissions from "@/components/DailyMissions"
import DailyGoalCard from "@/components/DailyGoalCard"
import WeeklyGoalCard from "@/components/WeeklyGoalCard"
import CronCountdown from "@/components/CronCountdown"
import { useUser } from "@clerk/nextjs"
import RecentTracksCard from "@/components/RecentTracksCard"
import StreamingGuideButton from '@/components/StreamingGuide'

export default function StreamingHub() {
  const { isSignedIn } = useUser()
  const [stationheadLive, setStationheadLive] = useState(false)
  const [todayStreams, setTodayStreams] = useState<number | null>(null)
  const [goalStreams, setGoalStreams] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if Stationhead is live - FIXED: removed nested useEffect
  useEffect(() => {
    setStationheadLive(Math.random() > 0.7)
  }, [])

  // Fetch user's stats.fm username and stream count
  useEffect(() => {
    if (isSignedIn) {
      fetchTodayStreams()
    } else {
      setLoading(false)
    }
  }, [isSignedIn])

  const fetchTodayStreams = async () => {
    try {
      const response = await fetch("/api/user-streams")
      if (response.ok) {
        const data = await response.json()
        setTodayStreams(data.totalStreams ?? 0)
        setGoalStreams(data.goalStreams ?? 0)
      }
    } catch (error) {
      console.error("Error fetching streams:", error)
      setTodayStreams(null)
      setGoalStreams(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-24 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white glow-text">
              🎵 Streaming Hub
            </h1>
            <p className="text-gray-300">
              Complete missions, track goals, and stream with ATINYs!
            </p>
          </div>

          {/* Your Streams Section - Shows actual ATEEZ stream count */}
          {isSignedIn && (
            <Card className="glass-card border-blue-500/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white font-bold text-lg">Your ATEEZ Streams Today</p>
                      <p className="text-gray-300 text-sm">Keep streaming to reach today's goal!</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    {loading ? (
                      <p className="text-gray-400 text-sm">Loading...</p>
                    ) : todayStreams !== null ? (
                      <>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-400">{todayStreams}</p>
                          <p className="text-gray-400 text-xs">Total ATEEZ</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-400">{goalStreams}</p>
                          <p className="text-gray-400 text-xs">Daily Goal Song</p>
                        </div>
                      </>
                    ) : (
                      <Button
                        className="bg-white hover:bg-gray-200 text-gray-800"
                        onClick={() => {
                          document.querySelector('[data-statsfm-card]')?.scrollIntoView({
                            behavior: 'smooth'
                          })
                        }}
                      >
                        Link stats.fm
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stationhead Live Banner */}
          {stationheadLive && (
            <Card className="glass-card border-red-500/50 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-white font-bold text-lg">🎉 Stationhead Party LIVE NOW!</p>
                      <p className="text-gray-300 text-sm">Join fellow ATINYs streaming together</p>
                    </div>
                  </div>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => window.open('https://stationhead.com/YOURUSERNAME', '_blank')}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Join Party
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* stats.fm Integration */}
          <div data-statsfm-card>
            <StatsFmCard />
          </div>

          {/* Community Goals - 2 Column Grid */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Community Goals</h2>
                <p className="text-gray-300 text-sm">
                  Work together with all ATINYs! These goals track the combined streams from everyone in the community.
                </p>
              </div>
              <CronCountdown />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <DailyGoalCard />
              <WeeklyGoalCard />
            </div>
          </div>

          {/* Daily Missions */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Daily Missions</h2>
            <p className="text-gray-300 text-sm mb-4">
              Personal streaming goals just for you! Complete these to check them off your list.
            </p>
            <DailyMissions />
          </div>

          {/* Recently Played */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Here are your recent tracks!</h2>
            <p className="text-gray-300 text-sm mb-4">
              While goals are updated every 30 minutes, your recent streams reflect your real time stats.fm
            </p>
            <RecentTracksCard />
          </div>

          {/* Curated Streaming Playlist */}
          <Card className="glass-card">
            <CardHeader className="glass-header-blue text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                ATINYTOWN Streaming Playlist
              </CardTitle>
              <CardDescription className="text-gray-300">
                Curated ATEEZ playlist optimized for streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-300">
                Follow our official ATINYTOWN playlist on Spotify! Updated regularly with streaming priorities and comeback tracks.
              </p>

              {/* Placeholder - Replace with your playlist embed when ready */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
                <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Playlist Coming Soon!</p>
                <p className="text-sm text-gray-400 mb-4">
                  We're curating the perfect streaming playlist for you
                </p>
                {/* Uncomment and add your playlist link when ready:
                <Button 
                  className="w-full bg-white hover:bg-gray-200 text-gray-800"
                  onClick={() => window.open('YOUR_SPOTIFY_PLAYLIST_LINK', '_blank')}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Open in Spotify
                </Button>
                */}
              </div>

              <p className="text-xs text-gray-400">
                💡 Feel free to share your own playlists on X! @ATINYTOWN1024 so it can be shared!
              </p>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-2">📻 Stationhead</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Join streaming parties with other ATINYs
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.open('https://stationhead.com', '_blank')}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>


            <StreamingGuideButton />

          </div>
        </div>
      </div>
    </>
  )
}