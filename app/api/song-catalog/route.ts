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

interface CatalogSong extends SongEntry {
  trackIds?: number[]
  variantCount?: number
}

function normalizeSongName(trackName: string): string {
  return trackName
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+-\s+(remaster(ed)?|mix|version|ver\.?|instrumental|live|japanese ver\.?|english ver\.?|sped up|slowed).*$/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function buildCatalogSongs(catalog: Record<string, SongEntry>): CatalogSong[] {
  const grouped = new Map<string, SongEntry[]>()

  for (const entry of Object.values(catalog)) {
    const normalizedName = normalizeSongName(entry.trackName)
    const existing = grouped.get(normalizedName) || []
    existing.push(entry)
    grouped.set(normalizedName, existing)
  }

  return Array.from(grouped.values())
    .map((entries) => {
      const sortedEntries = [...entries].sort((a, b) => {
        if (a.source !== b.source) {
          return a.source === 'manual' ? -1 : 1
        }
        return a.trackName.localeCompare(b.trackName)
      })

      const primary = sortedEntries[0]
      const trackIds = Array.from(new Set(sortedEntries.map((entry) => Number(entry.trackId))))

      return {
        ...primary,
        trackIds,
        variantCount: trackIds.length
      }
    })
    .sort((a, b) => a.trackName.localeCompare(b.trackName))
}

// GET: Fetch all songs in catalog
export async function GET() {
  try {
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    const songs = buildCatalogSongs(catalog)
    
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
          trackId: Number(trackId), // CHANGED: Ensure it's a number
          trackName,
          albumId: albumId || undefined, // CHANGED: Use undefined instead of null for consistency
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
      total: buildCatalogSongs(catalog).length
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