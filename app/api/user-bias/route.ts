import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET — fetch user's current bias
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      // Guest — client handles localStorage
      return NextResponse.json({ bias: null })
    }
    const bias = await kv.get<string>(`user:bias:${userId}`)
    return NextResponse.json({ bias })
  } catch (error) {
    console.error('Error fetching bias:', error)
    return NextResponse.json({ error: 'Failed to fetch bias' }, { status: 500 })
  }
}

// POST — save user's bias
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const { memberId } = await req.json()

    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }

    if (userId) {
      await kv.set(`user:bias:${userId}`, memberId)
    }
    // Guest bias is handled client-side via localStorage

    return NextResponse.json({ success: true, memberId })
  } catch (error) {
    console.error('Error saving bias:', error)
    return NextResponse.json({ error: 'Failed to save bias' }, { status: 500 })
  }
}