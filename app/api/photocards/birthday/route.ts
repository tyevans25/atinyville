import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const isDev = process.env.NODE_ENV === 'development'

const BIRTHDAYS: Record<string, { month: number; day: number; memberId: string }> = {
  // test member — always today in dev only
  ...(isDev ? { test: { month: new Date(Date.now() + 9*60*60*1000).getUTCMonth()+1, day: new Date(Date.now() + 9*60*60*1000).getUTCDate(), memberId: 'test' } } : {}),
  hj:  { month: 11, day: 7,  memberId: 'hj'  },
  sh:  { month: 4,  day: 3,  memberId: 'sh'  },
  yh:  { month: 3,  day: 23, memberId: 'yh'  },
  ys:  { month: 6,  day: 15, memberId: 'ys'  },
  sn:  { month: 7,  day: 10, memberId: 'sn'  },
  mg:  { month: 8,  day: 9,  memberId: 'mg'  },
  wy:  { month: 11, day: 26, memberId: 'wy'  },
  jh:  { month: 10, day: 12, memberId: 'jh'  },
}

function getKSTNow() {
  const now = new Date()
  return new Date(now.getTime() + 9 * 60 * 60 * 1000)
}

// GET — check if today is a birthday and user hasn't claimed it yet
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ card: null })

    const kst = getKSTNow()
    const month = kst.getUTCMonth() + 1
    const day = kst.getUTCDate()
    const year = kst.getUTCFullYear()

    // Find member whose birthday is today
    const birthday = Object.values(BIRTHDAYS).find(b => b.month === month && b.day === day)
    if (!birthday) return NextResponse.json({ card: null })

    // Check if already claimed this year
    const claimKey = `photocards:bday:${userId}:${birthday.memberId}:${year}`
    const claimed = await kv.get(claimKey)
    if (claimed) return NextResponse.json({ card: null })

    // Return the card info so frontend can show popup
    const cardNum = year - 2024
    const cardId = `bday-${birthday.memberId}-${birthday.memberId}-${cardNum}`
    return NextResponse.json({
      card: {
        id: cardId,
        memberId: birthday.memberId,
      }
    })
  } catch (error) {
    console.error('Birthday check error:', error)
    return NextResponse.json({ card: null })
  }
}

// POST — claim the birthday card
export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const kst = getKSTNow()
    const month = kst.getUTCMonth() + 1
    const day = kst.getUTCDate()
    const year = kst.getUTCFullYear()

    const birthday = Object.values(BIRTHDAYS).find(b => b.month === month && b.day === day)
    if (!birthday) return NextResponse.json({ error: 'No birthday today' }, { status: 400 })

    const claimKey = `photocards:bday:${userId}:${birthday.memberId}:${year}`
    const alreadyClaimed = await kv.get(claimKey)
    if (alreadyClaimed) return NextResponse.json({ error: 'Already claimed' }, { status: 409 })

    const cardNum = year - 2024
    const cardId = `bday-${birthday.memberId}-${birthday.memberId}-${cardNum}`

    // Save to collection
    await kv.sadd(`photocards:collection:${userId}`, cardId)
    // Mark as claimed for this year (expires after ~13 months)
    await kv.set(claimKey, true, { ex: 60 * 60 * 24 * 400 })

    return NextResponse.json({ success: true, cardId })
  } catch (error) {
    console.error('Birthday claim error:', error)
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }
}