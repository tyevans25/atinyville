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

    // Get the base URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/cron/check-streams`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })

    if (!res.ok) {
      const errorData = await res.json()
      return {
        success: false,
        error: errorData.error || 'Failed to trigger cron'
      }
    }

    const data = await res.json()
    return {
      success: true,
      data
    }

  } catch (err) {
    console.error('Error triggering cron:', err)
    return {
      success: false,
      error: 'Network error occurred'
    }
  }
}