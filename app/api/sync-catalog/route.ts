import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const CATALOG_KEY = 'ateez:songs:catalog'
const ATEEZ_ARTIST_ID = 164828

interface SongEntry {
  trackId: number
  trackName: string
  albumId?: number
  addedAt: string
  source: 'auto' | 'manual'
}

// Sync songs from user's stats.fm to catalog
export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get user's stats.fm username
    const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
    
    if (!statsfmUsername) {
      return NextResponse.json(
        { error: 'stats.fm not linked' },
        { status: 400 }
      )
    }
    
    // Fetch user's streams
    const res = await fetch(
      `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`
    )
    
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from stats.fm' },
        { status: 500 }
      )
    }
    
    const data = await res.json()
    const streams = data.items || []
    
    // Filter for ATEEZ songs
    const ateezStreams = streams.filter((s: any) => 
      s.artistIds?.includes(ATEEZ_ARTIST_ID)
    )
    
    // Get existing catalog
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    
    let added = 0
    let skipped = 0
    
    // Add unique songs to catalog
    for (const stream of ateezStreams) {
      const { trackId, trackName, albumId } = stream
      
      if (!catalog[trackId]) {
        catalog[trackId] = {
          trackId,
          trackName,
          albumId: albumId || null,
          addedAt: new Date().toISOString(),
          source: 'auto'
        }
        added++
      } else {
        skipped++
      }
    }
    
    // Save updated catalog
    if (added > 0) {
      await kv.set(CATALOG_KEY, catalog)
    }
    
    return NextResponse.json({
      success: true,
      added,
      skipped,
      total: Object.keys(catalog).length,
      message: `Synced ${added} new song(s) from stats.fm`
    })
  } catch (error) {
    console.error('Error syncing catalog:', error)
    return NextResponse.json(
      { error: 'Failed to sync catalog' },
      { status: 500 }
    )
  }
}