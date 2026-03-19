import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { auth } from '@clerk/nextjs/server'

const WELCOME_CARD_ID = 'welcome-ot8-ot8-1'

// Check if user has claimed welcome card
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ unclaimed: false })

  const flagKey = `photocards:welcomed:${userId}`
  const alreadyReceived = await kv.get(flagKey)

  return NextResponse.json({ unclaimed: !alreadyReceived })
}

// Award welcome card
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const flagKey = `photocards:welcomed:${userId}`
  const alreadyReceived = await kv.get(flagKey)

  if (alreadyReceived) {
    return NextResponse.json({ cardId: null })
  }

  await kv.set(flagKey, true)
  await kv.sadd(`photocards:collection:${userId}`, WELCOME_CARD_ID)

  return NextResponse.json({ cardId: WELCOME_CARD_ID })
}