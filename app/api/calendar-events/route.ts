import { NextResponse } from 'next/server'
import Papa from 'papaparse'

const CALENDAR_SHEET_ID = process.env.CALENDAR_SHEET_ID || 'YOUR_SHEET_ID_HERE'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${CALENDAR_SHEET_ID}/export?format=csv`

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  timeKST?: string // Optional time in KST (e.g., "15:00 KST")
  eventType: string
  title: string
  link: string
  description: string
  imageUrl?: string
  featuredMembers: string[]
}

export async function GET() {
  try {
    // Fetch from Google Sheets with 1 hour cache
    const response = await fetch(SHEET_URL, {
      next: { 
        revalidate: process.env.NODE_ENV === 'development' ? 60 : 3600 
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 })
    }

    const csvText = await response.text()

    // Parse CSV with papaparse
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })

    const events: CalendarEvent[] = []

    for (const row of parsed.data as any[]) {
      const date = row['Date']?.trim()
      const eventType = row['Event Type']?.trim()
      const title = row['Title']?.trim()
      const link = row['Link']?.trim()
      const description = row['Description']?.trim()
      const imageUrl = row['Image URL']?.trim()
      const timeKST = row['Time (KST)']?.trim()
      const featuredMembers = row['Featured Members']?.trim()

      if (!date || !eventType || !title) continue

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.warn(`Invalid date format: ${date}`)
        continue
      }

      events.push({
        date,
        eventType,
        title,
        link: link || '',
        description: description || '',
        imageUrl: imageUrl || undefined,
        timeKST: timeKST || undefined,
        featuredMembers: featuredMembers ? featuredMembers.split(',').map((m: string) => m.trim()) : []
      })
    }

    // Sort by date (newest first for display purposes)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ events })

  } catch (error) {
    console.error('Error in calendar API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}