// Run with: node scripts/check-spotify-previews.mjs
// Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are in your .env.local

import { readFileSync } from 'fs'

// Load .env.local manually
const env = readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val.length) process.env[key.trim()] = val.join('=').trim()
})

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local')
  process.exit(1)
}

// Get access token
async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

// Fetch all tracks for an artist
async function getAllTracks(token, artistId) {
  const tracks = []

  // Get all albums first
  let albumsUrl = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US&limit=50`
  while (albumsUrl) {
    const res = await fetch(albumsUrl, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    for (const album of data.items) {
      // Get tracks for each album
      const tRes = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks?market=US&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const tData = await tRes.json()
      for (const track of tData.items) {
        tracks.push({
          id: track.id,
          name: track.name,
          album: album.name,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls.spotify,
          durationMs: track.duration_ms,
        })
      }
    }
    albumsUrl = data.next
  }
  return tracks
}

async function main() {
  console.log('🔐 Getting Spotify token...')
  const token = await getToken()

  // ATEEZ's Spotify Artist ID
  const ATEEZ_ARTIST_ID = '1z4g3DjTBBZKhvAroFlhOM'

  console.log('🎵 Fetching all ATEEZ tracks...\n')
  const tracks = await getAllTracks(token, ATEEZ_ARTIST_ID)

  const withPreview = tracks.filter(t => t.previewUrl)
  const withoutPreview = tracks.filter(t => !t.previewUrl)

  console.log(`📊 RESULTS`)
  console.log(`─────────────────────────────`)
  console.log(`Total tracks found:     ${tracks.length}`)
  console.log(`✅ Have preview URLs:   ${withPreview.length}`)
  console.log(`❌ Missing previews:    ${withoutPreview.length}`)
  console.log(`─────────────────────────────\n`)

  if (withoutPreview.length > 0) {
    console.log('❌ Tracks WITHOUT previews:')
    withoutPreview.forEach(t => console.log(`   - ${t.name} (${t.album})`))
    console.log()
  }

  console.log('✅ Tracks WITH previews (sample — first 20):')
  withPreview.slice(0, 20).forEach(t => console.log(`   - ${t.name} (${t.album})`))

  // Save full results to a JSON file for reference
  const fs = await import('fs')
  fs.writeFileSync('spotify-preview-check.json', JSON.stringify({ withPreview, withoutPreview }, null, 2))
  console.log('\n💾 Full results saved to spotify-preview-check.json')
}

main().catch(console.error)
