'use server'

export async function triggerCronJob() {
  try {
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      return { 
        success: false, 
        error: 'CRON_SECRET not configured' 
      }
    }

    // Get the base URL - handle different environments
    let baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    console.log('Triggering cron at:', `${baseUrl}/api/cron/check-streams`)

    const res = await fetch(`${baseUrl}/api/cron/check-streams`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Cron response status:', res.status)

    if (!res.ok) {
      const text = await res.text()
      console.error('Cron error response:', text)
      
      // Try to parse as JSON, otherwise return text
      try {
        const errorData = JSON.parse(text)
        return {
          success: false,
          error: errorData.error || `HTTP ${res.status}`
        }
      } catch {
        return {
          success: false,
          error: `HTTP ${res.status}: ${text.substring(0, 100)}`
        }
      }
    }

    const data = await res.json()
    console.log('Cron success:', data)
    
    return {
      success: true,
      data
    }

  } catch (err) {
    console.error('Error triggering cron:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred'
    }
  }
}