"use client"

import { useState } from 'react'
import { Play, ExternalLink } from 'lucide-react'

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

interface VideoCardProps {
  video: Video
}

export default function VideoCard({ video }: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false)

  return (
    <>
      <div className="glass-card overflow-hidden group">
        {/* Thumbnail */}
        <div
          className="relative aspect-video cursor-pointer"
          onClick={() => setShowPlayer(true)}
        >
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover"
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-black ml-1" fill="black" />
            </div>
          </div>
          
          {/* Duration badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold text-white">
              {video.duration}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold line-clamp-2 mb-2 text-sm min-h-[2.5rem]">
            {video.title}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {video.category && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                {video.category}
              </span>
            )}
            {video.era && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                {video.era}
              </span>
            )}
          </div>
          
          {video.featuredMembers && video.featuredMembers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {video.featuredMembers.map((member, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-200 rounded-full border border-pink-500/30 shimmer-text font-medium relative overflow-hidden"
                >
                  {member}
                </span>
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mb-3">{video.year}</p>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPlayer(true)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <Play className="w-3 h-3" />
              Watch
            </button>
            <button 
              onClick={() => window.open(video.youtubeUrl, '_blank')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3 h-3" />
              YouTube
            </button>
          </div>
        </div>
      </div>
      
      {/* Embedded Player Modal */}
      {showPlayer && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPlayer(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
            onClick={() => setShowPlayer(false)}
          >
            ✕
          </button>
          <div 
            className="w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        
        .shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(236, 72, 153, 0.3) 0%,
            rgba(236, 72, 153, 0.8) 20%,
            rgba(249, 168, 212, 1) 40%,
            rgba(236, 72, 153, 0.8) 60%,
            rgba(236, 72, 153, 0.3) 100%
          );
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </>
  )
}
