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

    // Get the base URL - production should use the deployment URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    console.log('🔍 Triggering cron at:', `${baseUrl}/api/cron/check-streams`)
    console.log('🔑 Secret exists:', !!cronSecret, 'Length:', cronSecret.length)

    // Fire and forget — cron can take several minutes, don't block waiting for it
    fetch(`${baseUrl}/api/cron/check-streams`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    }).then(res => {
      console.log('📡 Cron completed with status:', res.status)
    }).catch(err => {
      console.error('💥 Cron background error:', err)
    })

    console.log('✅ Cron triggered in background')

    return {
      success: true,
      data: { message: 'Cron triggered — processing in background (check server logs for progress)' }
    }

  } catch (err) {
    console.error('💥 Error triggering cron:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred'
    }
  }
}