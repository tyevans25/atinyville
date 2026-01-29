import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const CATALOG_KEY = 'ateez:songs:catalog'

interface SongEntry {
  trackId: number
  trackName: string
  albumId?: number
  addedAt: string
  source: 'auto' | 'manual' // Track how it was added
}

// GET: Fetch all songs in catalog
export async function GET() {
  try {
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    
    // Convert to array and sort by name
    const songs = Object.values(catalog).sort((a, b) => 
      a.trackName.localeCompare(b.trackName)
    )
    
    return NextResponse.json({
      songs,
      count: songs.length
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    )
  }
}

// POST: Add song(s) to catalog
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { songs, source = 'manual' } = body
    
    if (!songs || !Array.isArray(songs)) {
      return NextResponse.json(
        { error: 'Songs array required' },
        { status: 400 }
      )
    }
    
    // Get existing catalog
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    
    let added = 0
    let skipped = 0
    
    for (const song of songs) {
      const { trackId, trackName, albumId } = song
      
      if (!trackId || !trackName) {
        skipped++
        continue
      }
      
      // Only add if doesn't exist
      if (!catalog[trackId]) {
        catalog[trackId] = {
          trackId,
          trackName,
          albumId: albumId || null,
          addedAt: new Date().toISOString(),
          source
        }
        added++
      } else {
        skipped++
      }
    }
    
    // Save updated catalog
    await kv.set(CATALOG_KEY, catalog)
    
    return NextResponse.json({
      success: true,
      added,
      skipped,
      total: Object.keys(catalog).length
    })
  } catch (error) {
    console.error('Error adding to catalog:', error)
    return NextResponse.json(
      { error: 'Failed to add songs' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a song from catalog
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('trackId')
    
    if (!trackId) {
      return NextResponse.json(
        { error: 'trackId required' },
        { status: 400 }
      )
    }
    
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    
    if (catalog[trackId]) {
      delete catalog[trackId]
      await kv.set(CATALOG_KEY, catalog)
      
      return NextResponse.json({
        success: true,
        message: 'Song removed from catalog'
      })
    }
    
    return NextResponse.json(
      { error: 'Song not found in catalog' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error deleting from catalog:', error)
    return NextResponse.json(
      { error: 'Failed to delete song' },
      { status: 500 }
    )
  }
}