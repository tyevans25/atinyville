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
import StationheadLiveBanner from '@/components/StationheadLiveBanner'

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
              Streaming Hub
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
                      <p className="text-gray-300 text-sm">Keep streaming to reach today&apos;s goal!</p>
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
          <div>
            <StationheadLiveBanner />
          </div>


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
              While goals are updated every hourly, your recent streams are updated based on stats.fm
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

              {/* Spotify Embed */}
              <div className="rounded-lg overflow-hidden border border-white/20">
                <iframe
                  src="https://open.spotify.com/embed/playlist/5isPnJGmao1bXq0W5lOVkN?utm_source=generator&theme=0"
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full"
                />
              </div>

              <Button
                className="w-full bg-white hover:bg-gray-200 text-gray-800"
                onClick={() => window.open('https://open.spotify.com/playlist/5isPnJGmao1bXq0W5lOVkN', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Spotify
              </Button>

              <p className="text-xs text-gray-400 text-center">
                💡 Feel free to share your own playlists on X (@AtinyTown_)! ATINY made playlists will also be shared here!
              </p>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <StreamingGuideButton />

        </div>
      </div>
    </>
  )
}