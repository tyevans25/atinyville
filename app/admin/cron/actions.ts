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

    const res = await fetch(`${baseUrl}/api/cron/check-streams`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    console.log('📡 Response status:', res.status)

    if (!res.ok) {
      const text = await res.text()
      console.error('❌ Error response:', text.substring(0, 200))
      
      return {
        success: false,
        error: `HTTP ${res.status}: Check Vercel function logs for details`
      }
    }

    const data = await res.json()
    console.log('✅ Success:', data)
    
    return {
      success: true,
      data
    }

  } catch (err) {
    console.error('💥 Error triggering cron:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred'
    }
  }
}