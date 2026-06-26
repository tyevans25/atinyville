import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'
import { STATIONS } from '@/lib/stationhead-stations'

const LIVE_KEY = (username: string) => `stationhead:manual:live:${username}`
const TTL = 60 * 60 * 4 // 4 hours auto-expire

async function isAuthorized() {
  const jar = await cookies()
  const cookie = jar.get('admin_session')
  return cookie?.value === process.env.ADMIN_PASSWORD
}

// GET: returns array of usernames currently manually marked live
export async function GET() {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = STATIONS.map(s => LIVE_KEY(s.username))
  const values = await kv.mget<boolean[]>(...keys)
  const live = STATIONS.filter((_, i) => values[i]).map(s => s.username)
  return NextResponse.json({ live })
}

// POST: { username, live: true|false }
export async function POST(request: Request) {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username, live } = await request.json()
  if (!username || typeof username !== 'string') {
    return NextResponse.json({ error: 'username required' }, { status: 400 })
  }

  if (live) {
    await kv.set(LIVE_KEY(username), true, { ex: TTL })
  } else {
    await kv.del(LIVE_KEY(username))
  }
  return NextResponse.json({ success: true })
}
