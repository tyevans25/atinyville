import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🎬 YouTube MV tracker cron started')

    // Get base URL
    let baseUrl: string
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else {
      baseUrl = 'https://atinytown.com'
    }

    // Call the YouTube tracker API to refresh stats
    const response = await fetch(`${baseUrl}/api/youtube-tracker`, {
      method: 'GET',
      headers: {
        'User-Agent': 'ATINYTOWN-Cron/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`YouTube tracker API failed: ${response.status}`)
    }

    const data = await response.json()
    
    console.log(`✅ Updated stats for ${data.videos?.length || 0} videos`)

    return NextResponse.json({
      success: true,
      videosUpdated: data.videos?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ YouTube tracker cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}