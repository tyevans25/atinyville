import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const CLOUD = "dbz7nif6b"

type Rarity = "common" | "rare" | "legendary"

const COLLECTIONS = [
  { id: "ghp4-concept", folder: "photocards/golden-hour-pt4", rarity: "common" as Rarity, pool: "general", groupLabel: "GOLDEN HOUR Pt.4", name: "Concept Photos", ext: "jpg", members: { hj: 4, sh: 4, yh: 4, ys: 4, sn: 4, mg: 4, wy: 4, jh: 4 } },
  { id: "ghp4-apple",   folder: "photocards/ghp4-apple-music", rarity: "rare" as Rarity,   pool: "general", groupLabel: "GOLDEN HOUR Pt.4", name: "Apple Music Exclusive", ext: "jpg", members: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 } },
  { id: "ghp4-target",  folder: "photocards/ghp4-target",      rarity: "rare" as Rarity,   pool: "general", groupLabel: "GOLDEN HOUR Pt.4", name: "Target Exclusive", ext: "jpg", members: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 } },
  { id: "ghp4-soundwave", folder: "photocards/ghp4-soundwave", rarity: "rare" as Rarity,   pool: "general", groupLabel: "GOLDEN HOUR Pt.4", name: "Soundwave Exclusive", ext: "jpg", members: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 } },
  { id: "ghp4-makestar", folder: "photocards/ghp4-makestar",   rarity: "rare" as Rarity,   pool: "general", groupLabel: "GOLDEN HOUR Pt.4", name: "Makestar Exclusive", ext: "jpg", members: { hj: 1, sh: 1, yh: 1, ys: 1, sn: 1, mg: 1, wy: 1, jh: 1 } },
]

const RARITY_WEIGHTS: Record<Rarity, number> = { common: 70, rare: 25, legendary: 5 }

const MEMBER_META: Record<string, { name: string; color: string; secondColor: string }> = {
  hj:  { name: "Hongjoong", color: "#FF6B35", secondColor: "#FF9A6C" },
  sh:  { name: "Seonghwa",  color: "#B48EE0", secondColor: "#D8B4FE" },
  yh:  { name: "Yunho",     color: "#4FC3F7", secondColor: "#BAE6FD" },
  ys:  { name: "Yeosang",   color: "#81C784", secondColor: "#BBF7D0" },
  sn:  { name: "San",       color: "#F06292", secondColor: "#FBCFE8" },
  mg:  { name: "Mingi",     color: "#FFD54F", secondColor: "#FEF08A" },
  wy:  { name: "Wooyoung",  color: "#CE93D8", secondColor: "#E9D5FF" },
  jh:  { name: "Jongho",    color: "#4DD0E1", secondColor: "#A5F3FC" },
  ot8: { name: "ATEEZ",     color: "#f97316", secondColor: "#fbbf24" },
}

function buildAllCards() {
  const cards: any[] = []
  for (const col of COLLECTIONS) {
    for (const [memberId, count] of Object.entries(col.members)) {
      const meta = MEMBER_META[memberId]
      for (let i = 1; i <= count; i++) {
        cards.push({
          id: `${col.id}-${memberId}-${i}`,
          collectionId: col.id,
          collectionName: col.name,
          groupLabel: col.groupLabel,
          rarity: col.rarity,
          memberId,
          memberName: meta.name,
          cardNumber: i,
          color: meta.color,
          secondColor: meta.secondColor,
          imageUrl: `https://res.cloudinary.com/${CLOUD}/image/upload/${col.folder}/${memberId}${i}.${col.ext}`,
        })
      }
    }
  }
  return cards
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if already awarded today (KST)
    const now = new Date()
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const today = kst.toISOString().split('T')[0]
    const awardKey = `photocards:awarded:${userId}:${today}`
    const alreadyAwarded = await kv.get(awardKey)
    if (alreadyAwarded) {
      return NextResponse.json({ error: 'Already awarded today' }, { status: 409 })
    }

    // Get owned cards
    const owned = await kv.smembers(`photocards:collection:${userId}`) as string[]
    const ownedSet = new Set(owned)

    // Build weighted eligible cards
    const allCards = buildAllCards()
    const eligible = allCards.filter(c => !ownedSet.has(c.id))
    if (eligible.length === 0) {
      return NextResponse.json({ error: 'Collection complete!' }, { status: 200 })
    }

    const weighted = eligible.map(c => ({ card: c, weight: RARITY_WEIGHTS[c.rarity as Rarity] }))
    const total = weighted.reduce((sum, w) => sum + w.weight, 0)
    let rand = Math.random() * total
    let picked = weighted[weighted.length - 1].card
    for (const { card, weight } of weighted) {
      rand -= weight
      if (rand <= 0) { picked = card; break }
    }

    // Mark as awarded today (expires in 48h)
    await kv.set(awardKey, picked.id, { ex: 172800 })

    return NextResponse.json({ card: picked })
  } catch (error) {
    console.error('Error awarding photocard:', error)
    return NextResponse.json({ error: 'Failed to award card' }, { status: 500 })
  }
}