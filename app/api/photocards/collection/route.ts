// app/api/photocards/collection/route.ts
import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'

function collectionKey(userId: string) {
  return `photocards:collection:${userId}`
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ cards: [] })
  try {
    const cards = await kv.smembers(collectionKey(userId))
    return NextResponse.json({ cards })
  } catch {
    return NextResponse.json({ cards: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, cardId } = await req.json()
    if (!userId || !cardId) return NextResponse.json({ ok: false }, { status: 400 })
    await kv.sadd(collectionKey(userId), cardId)
    return NextResponse.json({ ok: true, cardId })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}