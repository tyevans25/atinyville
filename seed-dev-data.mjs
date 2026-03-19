// seed-dev-data.mjs
// Run from your project root: node seed-dev-data.mjs

import { readFileSync } from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env.local')
const envFile = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^"|"$/g, '')]
    })
)

const REDIS_URL   = env.KV_REST_API_URL
const REDIS_TOKEN = env.KV_REST_API_TOKEN
const USER_ID     = 'user_3Ap654fXCpCZXmVJ9GyvefPyRoP'

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error('❌ Missing KV_REST_API_URL or KV_REST_API_TOKEN in .env.local')
  process.exit(1)
}

async function redisPipeline(commands) {
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  return res.json()
}

async function redisGet(key) {
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  })
  const data = await res.json()
  return data.result
}

async function seed() {
  console.log(`\n🌱 Seeding dev data for ${USER_ID}\n`)

  const kstDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().split('T')[0]
  const ttl = 172800 // 48h

  // 1. Streak
  console.log('📅 Setting streak data...')
  await redisPipeline([
    ['SET', `streak:${USER_ID}`, '7'],
    ['SET', `streak:${USER_ID}:last_active`, kstDate],
    ['SET', `streak:${USER_ID}:longest`, '7'],
  ])
  console.log('   ✓ Streak: 7 days (Corsair rank)')

  // 2. Photocards
  console.log('🃏 Setting photocard collection...')
  await redisPipeline([['DEL', `photocards:collection:${USER_ID}`]])
  const cards = [
    'ghp4-concept-hj-1', 'ghp4-concept-hj-2', 'ghp4-concept-hj-4',
    'ghp4-concept-sh-1',
    'ghp4-concept-yh-3',
    'ghp4-concept-ys-1',
    'ghp4-concept-sn-2', 'ghp4-concept-sn-4',
    'ghp4-concept-mg-4',
    'ghp4-concept-wy-1',
    'ghp4-concept-jh-2',
    'ghp4-apple-hj-1', 'ghp4-apple-sh-1', 'ghp4-apple-yh-1',
    'ghp4-target-ys-1',
    'welcome-ot8-ot8-1',
  ]
  await redisPipeline(cards.map(id => ['SADD', `photocards:collection:${USER_ID}`, id]))
  console.log(`   ✓ Photocards: ${cards.length} cards seeded`)

  // 3. Complete existing missions for dev user only
  // Reads today's missions and sets progress to target for each — does NOT modify the shared missions key
  console.log('🎯 Completing today\'s missions for dev user...')
  const missionsRaw = await redisGet(`daily:missions:${kstDate}`)
  if (missionsRaw) {
    const missions = typeof missionsRaw === 'string' ? JSON.parse(missionsRaw) : missionsRaw
    const progressCommands = missions.map(m => [
      'SET', `mission:progress:${USER_ID}:${kstDate}:${m.id}`, String(m.target), 'EX', ttl
    ])
    await redisPipeline(progressCommands)
    console.log(`   ✓ Completed ${missions.length} missions (user-scoped only, production safe)`)
  } else {
    console.log('   ⚠ No missions set for today — skipping mission progress')
  }

  // 4. Clear award key so photocard modal can trigger
  await redisPipeline([['DEL', `photocards:awarded:${USER_ID}:${kstDate}`]])
  console.log('   ✓ Award key cleared (photocard modal will trigger)')

  // 5. Wordle reset
  console.log('🟩 Clearing wordle played state...')
  await redisPipeline([['DEL', `wordle:played:${USER_ID}:${kstDate}`]])
  console.log('   ✓ Wordle reset for today')

  console.log('\n✅ All done!\n')
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
