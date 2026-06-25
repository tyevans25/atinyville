import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

// ── Vision check via Claude ───────────────────────────────
async function verifyScreenshot(
  imageUrl: string,
  voteType: 'web' | 'instagram',
  hashtag?: string
): Promise<{ pass: boolean; reason: string; confidence: number }> {
  if (!ANTHROPIC_KEY) return { pass: true, reason: 'No API key — skipping AI check', confidence: 0 }

  const prompt = voteType === 'web'
    ? `You are verifying a voting screenshot for ATEEZ at an award show.
A valid screenshot MUST show ALL of the following:
1. The artist name "ATEEZ" visible on screen
2. The number "30" shown as the vote count
3. Text saying "0 votes remaining" or similar indicating all votes were used
4. A voting UI (button, vote counter, etc.)

Look carefully at the image. Does it show all of these elements?
Respond with JSON only: { "pass": true/false, "reason": "brief explanation", "confidence": 0-100 }`
    : `You are verifying an Instagram comment screenshot for K-pop voting.
A valid screenshot MUST show ALL of the following:
1. An Instagram comment or comment box visible
2. The hashtag "${hashtag}" visible in the comment text
3. The comment appears to be posted (not just typed but not submitted)

Look carefully at the image. Does it show all of these elements?
Respond with JSON only: { "pass": true/false, "reason": "brief explanation", "confidence": 0-100 }`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: prompt },
          ],
        }],
      }),
    })

    const data = await res.json()
    const text = data.content?.[0]?.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch (e) {
    console.error('Vision check failed:', e)
    return { pass: true, reason: 'AI check failed — sending to manual review', confidence: 0 }
  }
}

// ── POST — submit proof ───────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const sourceId = formData.get('sourceId') as string
  const campaignId = formData.get('campaignId') as string
  const voteType = formData.get('voteType') as 'web' | 'instagram'
  const hashtag = formData.get('hashtag') as string | null

  if (!file || !sourceId || !campaignId || !voteType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // One submission per user per source per type
  const dedupKey = `voteproof:submitted:${userId}:${sourceId}:${voteType}`
  const alreadySubmitted = await kv.get(dedupKey)
  if (alreadySubmitted) {
    return NextResponse.json({ error: 'You have already submitted proof for this vote type' }, { status: 409 })
  }

  // File size cap — 10MB
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large — max 10MB' }, { status: 400 })
  }

  // Only allow images
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files accepted' }, { status: 400 })
  }

  try {
    // Upload to Cloudinary (temp folder — deleted after review)
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'vote-proofs', resource_type: 'image' },
        (err, result) => {
          if (err || !result) reject(err)
          else resolve(result as { secure_url: string; public_id: string })
        }
      ).end(buffer)
    })

    // Run Claude vision check
    const aiResult = await verifyScreenshot(uploadResult.secure_url, voteType, hashtag ?? undefined)

    const submissionId = `${userId}-${sourceId}-${voteType}-${Date.now()}`
    const submission = {
      id: submissionId,
      userId,
      sourceId,
      campaignId,
      voteType,
      hashtag: hashtag ?? null,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      submittedAt: new Date().toISOString(),
      aiPass: aiResult.pass,
      aiReason: aiResult.reason,
      aiConfidence: aiResult.confidence,
      status: 'pending', // pending | approved | rejected
    }

    // Store in Redis review queue (30 day TTL)
    await kv.set(`voteproof:submission:${submissionId}`, submission, { ex: 60 * 60 * 24 * 30 })
    await kv.sadd('voteproof:queue', submissionId)

    // Mark as submitted (prevent duplicates) — 30 day TTL
    await kv.set(dedupKey, true, { ex: 60 * 60 * 24 * 30 })

    return NextResponse.json({
      success: true,
      submissionId,
      aiPass: aiResult.pass,
      message: aiResult.pass
        ? 'Submission received and passed initial check — pending manual review'
        : 'Submission received — pending manual review',
    })
  } catch (err) {
    console.error('Submission error:', err)
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 })
  }
}

// ── GET — check if user already submitted ─────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sourceId = searchParams.get('sourceId')
  if (!sourceId) return NextResponse.json({ error: 'sourceId required' }, { status: 400 })

  const webKey = `voteproof:submitted:${userId}:${sourceId}:web`
  const igKey = `voteproof:submitted:${userId}:${sourceId}:instagram`

  const [webSubmitted, igSubmitted] = await Promise.all([
    kv.get(webKey),
    kv.get(igKey),
  ])

  return NextResponse.json({
    web: !!webSubmitted,
    instagram: !!igSubmitted,
  })
}