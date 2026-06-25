import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

const KV_PREFIX = process.env.NODE_ENV === 'development' ? 'dev:' : ''

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kstTime.toISOString().split('T')[0]
}

export async function POST() {
  try {
    const today = getKSTDate()
    await kv.del(`${KV_PREFIX}daily:missions:${today}`)
    return NextResponse.json({ success: true, message: `Cleared missions for ${today}. Trigger the cron to regenerate.` })
  } catch (error) {
    console.error('Error clearing missions:', error)
    return NextResponse.json({ error: 'Failed to clear missions' }, { status: 500 })
  }
}
