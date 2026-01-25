"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Quiz from "@/components/Quiz"
import { Trophy, Calendar, Music, ShoppingCart, ExternalLink, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react"

// EDIT THIS: Add your campaign updates here!
const campaignUpdates = [
  {
    id: 1,
    title: "🎵 Pre-Save GOLDEN HOUR: Part.4",
    description: "Pre-save the highly anticipated album on Spotify & Apple Music!",
    links: [
      { url: "https://open.spotify.com/prerelease/2Mnno3uSsiVdOpKJL4Vz5b?si=a70b8c79107d4aa5", label: "Spotify", color: "green" },
      { url: "https://ateez.sng.to/golden-hour-part-4", label: "Apple Music", color: "pink" }
    ],
    urgent: true
  },
  {
    id: 2,
    title: "🛒 Album Pre-Order",
    description: "Pre-order physical albums now - limited edition available!",
    links: [
      { url: "https://linktr.ee/atzinfo", label: "Pre-Order", color: "purple" }
    ],
    urgent: false
  },
  {
    id: 3,
    title: "📹 Stream 'In Your Fantasy' MV",
    description: "Let's get to 40M views!",
    links: [
      { url: "https://youtu.be/JOF2ZTqvzwY?si=NnH7BohnhSPyBDQ9", label: "Watch on YouTube", color: "orange" }
    ],
    urgent: false
  },
  {
    id: 4,
    title: "🏆 Daily ATEEZ Quiz",
    description: "Can you top the leaderboard?",
    links: [
      { url: "#quiz", label: "Start Quiz", color: "purple" }
    ],
    urgent: false
  }
]

// EDIT THIS: Add upcoming events here!
const upcomingEvents = [
  {
    id: 1,
    date: "2026-01-26",
    title: "Album Preview",
    description: "Album Preview Teaser!",
    type: "teaser"
  },
  {
    id: 2,
    date: "2026-01-27",
    title: "Concept Photo 3",
    description: "3rd set of concept photos released",
    type: "promotion"
  },
  {
    id: 3,
    date: "2026-01-28",
    title: "Concept Photo 3",
    description: "3rd set of concept photos released",
    type: "promotion"
  },
  {
    id: 4,
    date: "2026-01-29",
    title: "Concept Photo 3",
    description: "3rd set of concept photos released",
    type: "promotion"
  },
  {
    id: 5,
    date: "2026-01-30",
    title: "?",
    description: "Surprise content!",
    type: "teaser"
  },
  {
    id: 6,
    date: "2026-02-02",
    title: "Character Poster",
    description: "Character poster released",
    type: "promotion"
  },
  {
    id: 7,
    date: "2026-02-03",
    title: "MV Poster",
    description: "MV poster released",
    type: "promotion"
  },
  {
    id: 8,
    date: "2026-02-04",
    title: "MV Teaser 1",
    description: "MV teaser 1 released",
    type: "teaser"
  },
  {
    id: 9,
    date: "2026-02-05",
    title: "MV Teaser 2",
    description: "MV teaser 2 released",
    type: "teaser"
  },
  {
    id: 10,
    date: "2026-02-06",
    title: "GOLDEN HOUR Part.4 Album Release",
    description: "GOLDEN HOUR Part.4 album released",
    type: "release"
  }
]

export default function Home() {
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAllEvents, setShowAllEvents] = useState(false)

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campaignUpdates.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campaignUpdates.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + campaignUpdates.length) % campaignUpdates.length)
  }

  // Filter out past events and sort by date
  const futureEvents = upcomingEvents
    .filter(event => {
      const eventDate = new Date(event.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      return eventDate >= today
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Show only first 6 events unless "show all" is clicked
  const displayedEvents = showAllEvents ? futureEvents : futureEvents.slice(0, 6)

  if (quizStarted) {
    return <Quiz />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold text-white">
              ATINYTOWN
            </h1>
            <p className="text-xl md:text-2xl text-purple-100">
              ATINYs Hub for ATEEZ 🏴‍☠️
            </p>
          </div>

          {/* Campaign Updates Carousel */}
          <Card className="bg-white/95 backdrop-blur overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Active Campaigns
              </CardTitle>
              <CardDescription className="text-purple-100">
                Help ATEEZ by participating in current streaming campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                {/* Carousel content */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      {campaignUpdates[currentSlide].urgent && (
                        <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                          URGENT
                        </span>
                      )}
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">
                        {campaignUpdates[currentSlide].title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {campaignUpdates[currentSlide].description}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {campaignUpdates[currentSlide].links.map((link, index) => {
                          const colorClasses: Record<string, string> = {
                            green: "bg-green-600 hover:bg-green-700",
                            pink: "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600",
                            purple: "bg-purple-600 hover:bg-purple-700",
                            blue: "bg-blue-600 hover:bg-blue-700",
                            orange: "bg-orange-600 hover:bg-orange-700"
                          }
                          
                          return (
                            <Button
                              key={index}
                              onClick={() => {
                                if (link.url === "#quiz") {
                                  setQuizStarted(true)
                                } else {
                                  window.open(link.url, '_blank')
                                }
                              }}
                              className={`${colorClasses[link.color]} text-white`}
                            >
                              {link.label}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel controls */}
                <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center -translate-y-1/2 pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="pointer-events-auto bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-purple-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="pointer-events-auto bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronRight className="w-6 h-6 text-purple-600" />
                  </button>
                </div>

                {/* Carousel indicators */}
                <div className="flex justify-center gap-2 pb-4">
                  {campaignUpdates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide 
                          ? 'w-8 bg-purple-600' 
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Schedule Calendar */}
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {futureEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming events scheduled</p>
                ) : (
                  <>
                    <div className="space-y-4">
                      {displayedEvents.map((event) => {
                        const eventDate = new Date(event.date)
                        const today = new Date()
                        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        
                        return (
                          <div key={event.id} className="flex gap-4 border-l-4 border-purple-600 pl-4 py-2">
                            <div className="flex-shrink-0 text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {eventDate.getDate()}
                              </div>
                              <div className="text-xs text-gray-600 uppercase">
                                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <p className="text-sm text-gray-600">{event.description}</p>
                              <p className="text-xs text-purple-600 font-medium mt-1">
                                {daysUntil === 0 ? 'TODAY!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {futureEvents.length > 6 && (
                      <button
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="w-full mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm py-2 transition"
                      >
                        {showAllEvents ? '← Show Less' : `View All ${futureEvents.length} Events →`}
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

{/* Watch Next - Embedded Playlists */}
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* YouTube MV */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">📺 ATEEZ Present</h4>
                  <iframe 
                    style={{ borderRadius: '12px' }}
                    width="100%" 
                    height="200" 
                    src="https://www.youtube.com/embed/XP7zqLMu-mM?si=cEYGaCq_xHdE1Ngi" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>

                {/* Spotify Playlist */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">🎵 ATEEZ on Spotify</h4>
                  <iframe 
                    style={{ borderRadius: '12px' }}
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DXdlpBrO6fF3s?utm_source=generator&theme=0" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                  />
                </div>

                {/* YouTube Playlist */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">📺 WANTEEZ</h4>
                  <iframe 
                    style={{ borderRadius: '12px' }}
                    width="100%" 
                    height="200" 
                    src="https://www.youtube.com/embed/videoseries?si=506tvL7Jdx0S40eQ&amp;list=PL_G3lYLGW-D_yqkYBZgIhCTYrN18POCdQ" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz Feature Highlight */}
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    🎮 ATEEZ Streaming Quiz
                  </h3>
                  <p className="text-purple-100 mb-4">
                    Test your knowledge while streaming! Answer questions with embedded MVs 
                    and songs. Earn points, get speed bonuses, and challenge other ATINYs!
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">30s per question</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Speed bonuses</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Share on Twitter</span>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-6"
                  onClick={() => setQuizStarted(true)}
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-purple-200 text-sm">
          Made with 💜 by ATINYs, for ATINYs
        </p>
        <p className="text-purple-300 text-xs mt-2">
          Not affiliated with KQ Entertainment
        </p>
      </div>
    </div>
  )
}
