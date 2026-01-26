"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Radio, Sparkles, ExternalLink } from "lucide-react"
import Navigation from "@/components/Navigation"
import StatsFmCard from "@/components/StatsFmCard"

// Playlist generator song database
const ateezSongs = [
  "WORK", "Ice On My Teeth", "Crazy Form", "Bouncy", "Guerrilla",
  "Halazia", "Wonderland", "Answer", "Say My Name", "HALA HALA",
  "Inception", "Deja Vu", "Eternal Sunshine", "Silver Light", "Matz"
]

export default function StreamingHub() {
  const [stationheadLive, setStationheadLive] = useState(false)
  const [selectedSong, setSelectedSong] = useState("")
  const [generatedPlaylist, setGeneratedPlaylist] = useState<string[]>([])
  const [playlistLength, setPlaylistLength] = useState(10)

  // Check if Stationhead is live (you'd implement actual check)
  useEffect(() => {
    // TODO: Implement actual Stationhead API check
    // For now, randomly set for demo
    setStationheadLive(Math.random() > 0.7)
  }, [])

  const generatePlaylist = () => {
    if (!selectedSong) return

    // Simple algorithm: prioritize selected song and add variety
    const playlist = [selectedSong]
    const remaining = ateezSongs.filter(s => s !== selectedSong)
    
    // Shuffle and add songs
    const shuffled = remaining.sort(() => Math.random() - 0.5)
    playlist.push(...shuffled.slice(0, playlistLength - 1))

    setGeneratedPlaylist(playlist)
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
              Track streams, generate playlists, and join the party!
            </p>
          </div>

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
          <StatsFmCard />

          {/* Recent Performance */}
          <Card className="glass-card">
            <CardHeader className="glass-header-blue text-white">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Quick Links
              </CardTitle>
              <CardDescription className="text-gray-300">
                Stream ATEEZ on your favorite platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://open.spotify.com/artist/68KmkJeZGfwe1OUaivBa2L', '_blank')}
                >
                  <Music className="w-6 h-6" />
                  <span>Stream on Spotify</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://youtube.com/@ateez_official', '_blank')}
                >
                  <ExternalLink className="w-6 h-6" />
                  <span>Watch on YouTube</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => window.open('https://music.apple.com/us/artist/ateez/1441046989', '_blank')}
                >
                  <Music className="w-6 h-6" />
                  <span>Apple Music</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Playlist Generator */}
          <Card className="glass-card">
            <CardHeader className="glass-header-blue text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Playlist Generator
              </CardTitle>
              <CardDescription className="text-gray-300">
                Generate a custom streaming playlist based on your favorite song
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-300 mb-2 block">
                    Pick your favorite ATEEZ song:
                  </label>
                  <select
                    value={selectedSong}
                    onChange={(e) => setSelectedSong(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a song...</option>
                    {ateezSongs.map((song) => (
                      <option key={song} value={song} className="bg-gray-900">
                        {song}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300 mb-2 block">
                    Playlist length:
                  </label>
                  <select
                    value={playlistLength}
                    onChange={(e) => setPlaylistLength(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10} className="bg-gray-900">10 songs</option>
                    <option value={15} className="bg-gray-900">15 songs</option>
                    <option value={20} className="bg-gray-900">20 songs</option>
                    <option value={30} className="bg-gray-900">30 songs</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={generatePlaylist}
                disabled={!selectedSong}
                className="w-full bg-white hover:bg-gray-200 text-gray-800"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Playlist
              </Button>

              {generatedPlaylist.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-4">
                  <h3 className="text-white font-semibold mb-3">Your Streaming Playlist:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {generatedPlaylist.map((song, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                      >
                        <span className="text-blue-400 font-mono text-sm w-8">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span>{song}</span>
                        {index === 0 && (
                          <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            Your pick
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 Tip: Loop this playlist while studying or working to boost streams!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-2">📻 Stationhead</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Join group streaming parties with other ATINYs
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

            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-2">🎯 Streaming Guide</h3>
                <p className="text-gray-300 text-sm mb-3">
                  Tips and best practices for effective streaming
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  View Guide
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </>
  )
}
