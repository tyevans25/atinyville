import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Only your Clerk user ID can access this
const ADMIN_USER_ID = process.env.ADMIN_CLERK_USER_ID

function isAdmin(userId: string) {
  return userId === ADMIN_USER_ID
}

// GET — fetch pending queue
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const queueIds = await kv.smembers('voteproof:queue') as string[]
    const submissions = []

    for (const id of queueIds) {
      const sub = await kv.get(`voteproof:submission:${id}`)
      if (sub) submissions.push(sub)
    }

    // Sort newest first
    submissions.sort((a: any, b: any) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )

    return NextResponse.json({ submissions, total: submissions.length })
  } catch (err) {
    console.error('Review fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// POST — approve or reject a submission
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { submissionId, action } = await req.json()
  if (!submissionId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'submissionId and action (approve|reject) required' }, { status: 400 })
  }

  try {
    const submission = await kv.get<{
      id: string
      userId: string
      sourceId: string
      campaignId: string
      voteType: string
      cloudinaryId: string
      imageUrl: string
    }>(`voteproof:submission:${submissionId}`)

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Increment vote count for this source+type
      const countKey = `voteproof:count:${submission.sourceId}:${submission.voteType}`
      await kv.incr(countKey)

      // Also increment overall campaign count
      await kv.incr(`voteproof:count:${submission.campaignId}:total`)
    }

    // Delete image from Cloudinary regardless of action
    await cloudinary.uploader.destroy(submission.cloudinaryId)

    // Remove from queue
    await kv.srem('voteproof:queue', submissionId)

    // Delete submission record
    await kv.del(`voteproof:submission:${submissionId}`)

    return NextResponse.json({
      success: true,
      action,
      submissionId,
      message: action === 'approve' ? 'Vote counted and image deleted' : 'Submission rejected and image deleted',
    })
  } catch (err) {
    console.error('Review action error:', err)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}