"use client"

import { useState, useEffect } from 'react'
import VideoCard from '@/components/VideoCard'
import Navigation from '@/components/Navigation'
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, RefreshCw } from 'lucide-react'

interface Video {
  youtubeId: string
  youtubeUrl: string
  title: string
  thumbnail: string
  uploadDate: string
  year: number
  duration: string
  category: string
  era: string
  featuredMembers: string[]
  notes: string
}

const CATEGORIES = [
  'Music Video',
  'Performance',
  'Fan Cam',
  'Variety',
  'Guest',
  'Fashion',
  'Dance Practice',
  'Behind the Scenes',
  'Other'
]

const ERAS = [
  'All',
  'GOLDEN HOUR : Part.4',
  'GOLDEN HOUR : Part.3',
  'GOLDEN HOUR : Part.1',
  'GOLDEN HOUR : Part.2',
  'THE WORLD EP.FIN : WILL',
  'THE WORLD EP.2 : OUTLAW',
  'THE WORLD EP.1 : MOVEMENT',
  'ZERO : FEVER EPILOGUE',
  'ZERO : FEVER Part.3',
  'ZERO : FEVER Part.2',
  'ZERO : FEVER Part.1',
  'TREASURE EPILOGUE: Action to Answer',
  'TREASURE EP.FIN: All to Action',
  'TREASURE EP.3: One to All',
  'TREASURE EP.2: Zero to One',
  'TREASURE EP.1: All to Zero',
  'Other'
]

const MEMBERS = [
  'Hongjoong',
  'Seonghwa',
  'Yunho',
  'Yeosang',
  'San',
  'Mingi',
  'Wooyoung',
  'Jongho'
]

interface CategoryCarouselProps {
  title: string
  videos: Video[]
}

function CategoryCarousel({ title, videos }: CategoryCarouselProps) {
  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${title}`)
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Sort videos by date (newest first)
  const sortedVideos = [...videos].sort((a, b) =>
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  )

  if (sortedVideos.length === 0) return null

  return (
    <div className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
          {sortedVideos.length} {sortedVideos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left Arrow */}
        {sortedVideos.length > 3 && (
          <button
            onClick={() => scrollContainer('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Videos Container */}
        <div
          id={`carousel-${title}`}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedVideos.map(video => (
            <div key={video.youtubeId} className="flex-shrink-0 w-80">
              <VideoCard video={video} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {sortedVideos.length > 3 && (
          <button
            onClick={() => scrollContainer('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-xl"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}

export default function MediaHubPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedEra, setSelectedEra] = useState('All')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async (force = false) => {
    try {
      const url = force
        ? '/api/variety-videos?force=true'
        : '/api/variety-videos'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchVideos(true)
  }

  const toggleMember = (member: string) => {
    setSelectedMembers(prev =>
      prev.includes(member)
        ? prev.filter(m => m !== member)
        : [...prev, member]
    )
  }

  // Get unique years from videos
  const years = ['all', ...Array.from(new Set(videos.map(v => v.year))).sort((a, b) => b - a)]

  // Filter videos
  const filteredVideos = videos.filter(video => {
    if (selectedYear !== 'all' && video.year !== parseInt(selectedYear)) return false
    if (selectedEra !== 'All' && video.era !== selectedEra) return false
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false

    // Member filter
    if (selectedMembers.length > 0) {
      const videoMembers = video.featuredMembers.map(m => m.toLowerCase())
      const hasAllSelected = selectedMembers.every(m =>
        videoMembers.some(vm => vm.includes(m.toLowerCase()))
      )
      if (!hasAllSelected) return false
    }

    return true
  })

  // Group videos by category
  const videosByCategory = CATEGORIES.map(category => ({
    category,
    videos: filteredVideos.filter(v => v.category === category)
  }))

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading videos...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 glow-text">
              ATEEZ Media
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Music Videos • Performances • Variety Shows
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-card p-6 mb-10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Filters</h3>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg transition text-sm font-semibold"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Year Filter */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Year:</p>
              <div className="flex flex-wrap gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedYear === year.toString()
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {year === 'all' ? 'All Years' : year}
                  </button>
                ))}
              </div>
            </div>

            {/* Era Filter */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-300 mb-3">Era:</p>
              <div className="flex flex-wrap gap-2">
                {ERAS.map(era => (
                  <button
                    key={era}
                    onClick={() => setSelectedEra(era)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                      selectedEra === era
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* Member Filter */}
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Members:</p>
              <div className="flex flex-wrap gap-2">
                {MEMBERS.map(member => (
                  <button
                    key={member}
                    onClick={() => toggleMember(member)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedMembers.includes(member)
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {member}
                  </button>
                ))}
                {selectedMembers.length > 0 && (
                  <button
                    onClick={() => setSelectedMembers([])}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                  >
                    Clear ({selectedMembers.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-400 text-sm mb-6 px-2">
            Showing {filteredVideos.length} of {videos.length} videos
          </p>

          {/* Category Carousels */}
          {videosByCategory.map(({ category, videos }) => (
            <CategoryCarousel
              key={category}
              title={category}
              videos={videos}
            />
          ))}

          {/* No Results */}
          {filteredVideos.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-gray-400 mb-2">No videos found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </>
  )
}
