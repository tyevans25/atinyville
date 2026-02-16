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
import CommunityPlaylists from '@/components/CommunityPlaylists'
import CompactRefreshButton from "@/components/ManualRefreshButton"

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
                        <CompactRefreshButton />
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
          {/* Manual Refresh Button */}
          {isSignedIn && (
            <div>
            </div>
          )}
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

          {/* Community Playlists */}
          <Card className="glass-card">
            <CardHeader className="glass-header-blue text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                ATINYTOWN Streaming Playlists
              </CardTitle>
              <CardDescription className="text-gray-300">
                Curated ATEEZ playlists optimized for streaming by ATINYs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <CommunityPlaylists />
            </CardContent>
          </Card>

          {/* Info Cards */}
          <StreamingGuideButton />

        </div>
      </div>
    </>
  )
}