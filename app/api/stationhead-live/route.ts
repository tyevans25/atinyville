import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const username = 'bluebirdfm' // Your Stationhead username
    
    const response = await fetch(`https://stationhead.com/api/station/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BLUEBIRDFMBot/1.0)'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { isLive: false, listenerCount: 0 },
        { status: 200 }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      isLive: data.isLive || false,
      listenerCount: data.listenerCount || 0
    })
  } catch (error) {
    console.error('Error fetching Stationhead status:', error)
    return NextResponse.json(
      { isLive: false, listenerCount: 0 },
      { status: 200 }
    )
  }
}