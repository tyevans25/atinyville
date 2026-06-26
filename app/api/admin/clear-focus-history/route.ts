import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'

async function isAuthorized() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function POST() {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const focus = await kv.get<{ videoId: string }>('focus:mv')
  if (!focus?.videoId) return NextResponse.json({ error: 'No focus MV set' }, { status: 400 })

  await kv.del(`focus:mv:history:${focus.videoId}`)
  return NextResponse.json({ success: true, videoId: focus.videoId })
}
