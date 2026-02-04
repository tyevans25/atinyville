"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Quiz from "@/components/Quiz"
import { Trophy, Calendar, Music, ShoppingCart, ExternalLink, ChevronLeft, ChevronRight, Play, Zap } from "lucide-react"
import Navigation from "@/components/Navigation"
import DailyGoalSlide from "@/components/DailyGoalSlide"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

declare global {
  interface Window {
    twttr: any
  }
}

// Helper function to convert KST to local timezone
const convertKSTtoLocal = (kstDateString: string, kstTime?: string) => {
  // If time is provided, use it; otherwise default to midnight
  const timeString = kstTime || '00:00:00'
  // Parse as KST (UTC+9)
  const date = new Date(kstDateString + 'T' + timeString + '+09:00')
  return date
}

// EDIT THIS: Add your campaign updates here!
const campaignUpdates = [
    {
    id: 1,
    title: "🫧 GOLDEN HOUR: Part.4 PREVIEW LIVE",
    description: "Watch the preview live for ATEEZ's highly anticipated album!",
    videoUrl: "https://www.youtube.com/embed/ct3_SOh-d-o?si=xkks96PcRt_YSndf",
    urgent: false
  },
  {
    id: 2,
    title: "🫧 Pre-Save GOLDEN HOUR: Part.4",
    description: "Pre-save the highly anticipated album on Spotify & Apple Music!",
    spotifyUrl: "https://open.spotify.com/embed/prerelease/2Mnno3uSsiVdOpKJL4Vz5b?utm_source=generator",
    links: [
      { url: "https://open.spotify.com/prerelease/2Mnno3uSsiVdOpKJL4Vz5b?si=a70b8c79107d4aa5", label: "Spotify", color: "green" },
      { url: "https://ateez.sng.to/golden-hour-part-4", label: "Apple Music", color: "pink" }
    ],
    urgent: true
  },
      {
    id: 3,
    title: "\"Adrenaline\" MV Teaser",
    description: "Sneak peek of the title song \"Adrenaline\"!",
    videoUrl: "https://www.youtube.com/embed/nvCan9BZqAY?si=1W4iVupHMxZG7FFt",
    links: [
      { url: "https://youtu.be/nvCan9BZqAY?si=1W4iVupHMxZG7FFt", label: "Watch on YouTube", color: "orange" }
    ],
    urgent: false
  },
  {
    id: 4,
    title: "GOLDEN HOUR: Part.4 Album Teaser",
    description: "Get a sneak peek of the upcoming album!",
    videoUrl: "https://www.youtube.com/embed/hPdS8GVb_9w?si=6QaxkRWpqqY7eNkG",
    links: [
      { url: "https://linktr.ee/atzinfo", label: "Pre-Order", color: "purple" }
    ],
    urgent: false
  },
  {
    id: 5,
    title: "\"Adrenaline\" MV Trailer",
    description: "Check out the trailer for the upcoming MV for \"Adrenaline\"!",
    videoUrl: "https://www.youtube.com/embed/gBvUjhPy5v4?si=Y2miG7LKOMLF9dP_",
    urgent: false
  },
  {
    id: 6,
    title: "🛒 Pre-Order GOLDEN HOUR: Part.4",
    description: "Pre-order physical albums!",
    imageUrl: "https://image.static.bstage.in/cdn-cgi/image/metadata=none,dpr=1,f=auto,width=640/ateez/dea14100-3e72-4fd3-9303-67a3201448c0/072b473d-4b13-458d-8375-783ba2ccac0f/ori.jpg",
    links: [
      { url: "https://linktr.ee/atzinfo", label: "Pre-Order", color: "purple" }
    ],
    urgent: false
  },
  {
    id: 7,
    title: "🏆 Daily ATEEZ Quiz",
    description: "Can you top the leaderboard?",
    links: [
      { url: "#quiz", label: "Start Quiz", color: "purple" }
    ],
    urgent: false
  },
  {
    id: 8,
    component: <DailyGoalSlide />
  }
]

// EDIT THIS: Add upcoming events here (dates in KST)
const upcomingEvents = [
  {
    id: 1,
    date: "2026-01-26",
    time: "00:00:00",
    title: "Album Preview",
    description: "Album Preview Teaser!",
    type: "teaser"
  },
  {
    id: 2,
    date: "2026-01-27",
    time: "00:00:00",
    title: "Concept Photo 3",
    description: "3rd set of concept photos released",
    type: "promotion"
  },
  {
    id: 3,
    date: "2026-01-28",
    time: "00:00:00",
    title: "Concept Photo 3",
    description: "3rd set of concept photos released",
    type: "promotion"
  },
  {
    id: 4,
    date: "2026-01-29",
    time: "00:00:00",
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
    time: "14:00:00",
    title: "Character Poster",
    description: "Character poster released",
    type: "promotion"
  },
  {
    id: 7,
    date: "2026-02-03",
    time: "14:00:00",
    title: "MV Poster",
    description: "MV poster released",
    type: "promotion"
  },
  {
    id: 8,
    date: "2026-02-04",
    time: "14:00:00",
    title: "MV Teaser 1",
    description: "MV teaser 1 released",
    type: "teaser"
  },
  {
    id: 9,
    date: "2026-02-05",
    time: "14:00:00",
    title: "MV Teaser 2",
    description: "MV teaser 2 released",
    type: "teaser"
  },
  {
    id: 10,
    date: "2026-02-06",
    time: "14:00:00",
    title: "GOLDEN HOUR Part.4 Album Release",
    description: "GOLDEN HOUR Part.4 album released",
    type: "release"
  },
  {
    id: 11,
    date: "2026-02-07",
    time: "18:00:00",
    title: "'On The Road' Spotify Live Version Release",
    description: "'On The Road' Spotify Live Version released",
    type: "release"
  },
  {
    id: 12,
    date: "2026-02-06",
    time: "22:00:00",
    title: "ATTEZ on 'The Seasons' KBS Music Talk Show",
    description: "'Music Talk Show appearance",
    type: "promotion"
  },
  {
    id: 13,
    date: "2026-02-08",
    time: "20:00:00",
    title: "ATTEZ on '1N2D' KBS Variety Show",
    description: "'1N2D' Variety Show appearance",
    type: "promotion"
  },
  {
    id: 14,
    date: "2026-02-06",
    time: "17:05:00",
    title: "ATEEZ Comeback Stage on KBS Music Bank",
    description: "Comeback stage on KBS Music Bank",
    type: "promotion"
  },
  {
    id: 15,
    date: "2026-02-05",
    time: "20:00:00",
    title: "ATEEZ GOLDEN HOUR Part.4 Preview Live",
    description: "Album preview live stream",
    type: "promotion"
  },
  {
    id: 16,
    date: "2026-02-07",
    time: "18:05:00",
    title: "Jongho on 'Immortal Songs'",
    description: "Jongho appears on 'Immortal Songs'",
    type: "promotion"
  },
  {
    id: 17,
    date: "2026-02-08",
    time: "15:25:00",
    title: "ATEEZ Comeback Stage on SBS Inkigayo",
    description: "ATEEZ appears on SBS Inkigayo",
    type: "promotion"
  },
  {
    id: 18,
    date: "2026-02-08",
    time: "16:40:00",
    title: "San on 'Boss in the Mirror",
    description: "San continued appearance on 'Boss in the Mirror'",
    type: "promotion"
  },
  {
    id: 19,
    date: "2026-02-15",
    time: "18:00:00",
    title: "ATEEZ @ Hanteo Music Awards",
    description: "ATEEZ attends Hanteo Music Awards; no performance",
    type: "promotion"
  },
  {
    id: 20,
    date: "2026-02-26",
    time: "22:00:00",
    title: "WOOYOUNG @ PRADA Show for Milan Fashion Week",
    description: "Wooyoung fashion week appearance",
    type: "appearance"
  },
  {
    id: 21,
    date: "2026-02-22",
    time: "19:00:00",
    title: "2026 World Tour: In Your Fantasy in Singapore",
    description: "Continuation of Asia leg of world tour",
    type: "appearance"
  },
    {
    id: 22,
    date: "2026-02-12",
    title: "WOOYOUNG on RISBAE Youtube Channel",
    description: "Wooyoung gets a makeover by RISBAE!",
    type: "variety"
  },
        {
    id: 23,
    date: "2026-02-11",
    title: "ATEEZ @ The Performance",
    description: "ATEEZ headlines Mynavi'The Performance' live concert event, Day 1",
    type: "performance"
  },
      {
    id: 24,
    date: "2026-02-12",
    title: "ATEEZ @ The Performance",
    description: "ATEEZ headlines Mynavi'The Performance' live concert event, Day 2",
    type: "performance"
  }
]

export default function Home() {
  const { isSignedIn, user } = useUser()
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showAllEvents, setShowAllEvents] = useState(false)
  const [carouselPaused, setCarouselPaused] = useState(false)
  
  // Quiz status checking
  const [checkingPlayStatus, setCheckingPlayStatus] = useState(false)
  const [hasPlayedToday, setHasPlayedToday] = useState(false)

  // Check if user has played today when signed in
  useEffect(() => {
    if (isSignedIn && user) {
      checkIfPlayedToday()
    }
  }, [isSignedIn, user])

  const checkIfPlayedToday = async () => {
    if (!user?.id) return
    
    setCheckingPlayStatus(true)
    try {
      const response = await fetch('/api/quiz/check-played', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      const data = await response.json()
      setHasPlayedToday(data.hasPlayed)
    } catch (error) {
      console.error('Error checking play status:', error)
    } finally {
      setCheckingPlayStatus(false)
    }
  }

  const handleQuizClick = () => {
    if (!isSignedIn) {
      // Not signed in, do nothing (stays on page)
      return
    }
    
    if (hasPlayedToday) {
      // Already played, do nothing
      return
    }
    
    // Signed in and hasn't played -> start quiz
    setQuizStarted(true)
  }

  const getQuizButtonText = () => {
    if (!isSignedIn) return "Start Quiz"
    if (checkingPlayStatus) return "Checking..."
    if (hasPlayedToday) return "Come Back Tomorrow 🏴‍☠️"
    return "Start Quiz"
  }

  // Auto-advance carousel (only when not paused)
  useEffect(() => {
    if (carouselPaused) return

    // Give daily goal slide (index 6) more time - 10 seconds vs 7 seconds for others
    const slideTime = currentSlide === 6 ? 10000 : 7000

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % campaignUpdates.length)
    }, slideTime)

    return () => clearInterval(interval)
  }, [carouselPaused, currentSlide])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % campaignUpdates.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + campaignUpdates.length) % campaignUpdates.length)
  }

  // Filter out past events and sort by date (with KST conversion)
  const futureEvents = upcomingEvents
    .filter(event => {
      const eventDate = convertKSTtoLocal(event.date, event.time)
      const now = new Date()
      return eventDate >= now
    })
    .sort((a, b) => convertKSTtoLocal(a.date, a.time).getTime() - convertKSTtoLocal(b.date, b.time).getTime())

  const displayedEvents = showAllEvents ? futureEvents : futureEvents.slice(0, 6)

  if (quizStarted) {
    return <Quiz />
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 pt-16">
        <div className="container mx-auto px-4 py-4 md:py-8">

          {/* Campaign Updates Carousel */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 text-white">
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div
                className="relative"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                {/* Carousel content */}
                <div className="p-6 md:p-8 carousel-smooth">
                  {campaignUpdates[currentSlide].component ? (
                    // Render custom component
                    campaignUpdates[currentSlide].component
                  ) : (
                    // Render regular campaign
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        {campaignUpdates[currentSlide].urgent && (
                          <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                            URGENT
                          </span>
                        )}
                        <h3 className="text-2xl font-bold mb-2 text-white">
                          {campaignUpdates[currentSlide].title}
                        </h3>
                        <p className="text-gray-300 mb-4">
                          {campaignUpdates[currentSlide].description}
                        </p>

                        {campaignUpdates[currentSlide].videoUrl && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
                            <iframe
                              width="100%"
                              height="100%"
                              src={campaignUpdates[currentSlide].videoUrl}
                              title="Campaign video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}

                        {campaignUpdates[currentSlide].imageUrl && (
                          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
                            <img
                              src={campaignUpdates[currentSlide].imageUrl}
                              alt={campaignUpdates[currentSlide].title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {campaignUpdates[currentSlide].spotifyUrl && (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <iframe
                              src={campaignUpdates[currentSlide].spotifyUrl}
                              width="100%"
                              height="152"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              style={{ borderRadius: '12px' }}
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {campaignUpdates[currentSlide].links?.map((link, index) => {
                            const colorClasses: Record<string, string> = {
                              green: "bg-white hover:bg-gray-200 text-gray-800 hover:text-gray-900",
                              pink: "bg-white hover:bg-gray-200 text-gray-800 hover:text-gray-900",
                              purple: "bg-white hover:bg-gray-200 text-gray-800 hover:text-gray-900",
                              blue: "bg-white hover:bg-gray-200 text-gray-800 hover:text-gray-900",
                              orange: "bg-white hover:bg-gray-200 text-gray-800 hover:text-gray-900"
                            }

                            return (
                              <Button
                                key={index}
                                onClick={() => {
                                  if (link.url === "#quiz") {
                                    handleQuizClick()
                                  } else {
                                    window.open(link.url, '_blank')
                                  }
                                }}
                                className={`${colorClasses[link.color]}`}
                              >
                                {link.label}
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Carousel controls */}
                <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center -translate-y-1/2 pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 rounded-full p-2 shadow-lg transition"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Carousel indicators */}
                <div className="flex justify-center gap-2 pb-4">
                  {campaignUpdates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${index === currentSlide
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-white/40'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Schedule Calendar */}
            <Card className="glass-card">
              <CardHeader className="glass-header-blue text-white">
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
                        const eventDate = convertKSTtoLocal(event.date, event.time)
                        const now = new Date()
                        const msUntil = eventDate.getTime() - now.getTime()
                        const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60))
                        const daysUntil = Math.floor(hoursUntil / 24)

                        // Format time display with timezone
                        let timeDisplay = ''
                        if (event.time) {
                          const localTime = eventDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                          const timezone = eventDate.toLocaleTimeString('en-US', {
                            timeZoneName: 'short'
                          }).split(' ').pop()
                          timeDisplay = `${localTime} ${timezone}`
                        }

                        return (
                          <div key={event.id} className="flex gap-4 border-l-4 border-white/50 pl-4 py-2">
                            <div className="flex-shrink-0 text-center">
                              <div className="text-2xl font-bold text-white">
                                {eventDate.getDate()}
                              </div>
                              <div className="text-xs text-gray-300 uppercase">
                                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{event.title}</h4>
                              <p className="text-sm text-gray-300">{event.description}</p>
                              <div className="flex flex-wrap gap-2 items-center mt-1">
                                <p className="text-xs text-white font-medium">
                                  {hoursUntil < 1
                                    ? 'Happening now!'
                                    : hoursUntil < 24
                                      ? `In ${hoursUntil} hours`
                                      : daysUntil === 1
                                        ? 'Tomorrow'
                                        : `In ${daysUntil} days`}
                                </p>
                                {timeDisplay && (
                                  <p className="text-xs text-blue-400 font-semibold">
                                    • {timeDisplay}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {futureEvents.length > 6 && (
                      <button
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="w-full mt-4 text-white hover:text-gray-400 font-medium text-sm py-2 transition"
                      >
                        {showAllEvents ? '← Show Less' : `View All ${futureEvents.length} Events →`}
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Watch Next - Embedded Playlists */}
            <Card className="glass-card">
              <CardHeader className="glass-header-blue text-white">
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* YouTube MV */}
                <div>
                  <h4 className="font-semibold text-white mb-2 text-sm">📺 ATEEZ Present</h4>
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
                  <h4 className="font-semibold text-white mb-2 text-sm">🎵 ATEEZ on Spotify</h4>
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
                  <h4 className="font-semibold text-white mb-2 text-sm">📺 WANTEEZ</h4>
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
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-white/10 text-white mt-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    🎮 ATEEZ Streaming Quiz
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Test your knowledge while streaming! Answer questions with embedded MVs
                    and songs. Earn points, get speed bonuses, and challenge other ATINYs!
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">Speed bonuses</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">Share on Twitter</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="lg"
                    className={`text-lg px-8 py-6 ${
                      hasPlayedToday 
                        ? 'bg-gray-500 hover:bg-gray-500 cursor-not-allowed text-white' 
                        : 'bg-white text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={handleQuizClick}
                    disabled={hasPlayedToday || checkingPlayStatus}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    {getQuizButtonText()}
                  </Button>
                  
                  {hasPlayedToday && (
                    <p className="text-xs text-gray-300">
                      You've already played today!
                    </p>
                  )}
                  
                  {!isSignedIn && (
                    <p className="text-xs text-gray-300">
                      Sign in to play the quiz
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-gray-400 text-sm">
          Made for ATINYs
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Not affiliated with KQ Entertainment
        </p>
      </div>
    </>
  )
}