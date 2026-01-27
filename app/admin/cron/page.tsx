'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { triggerCronJob } from './actions'

export default function AdminCronTrigger() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrigger = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await triggerCronJob()
      
      if (!response.success) {
        setError(response.error || 'Failed to trigger cron')
        return
      }

      setResult(response.data)

    } catch (err) {
      console.error('Error triggering cron:', err)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin: Manual Cron Trigger</h1>
      <p className="text-gray-600">
        Manually trigger the stream counting cron job. Normally runs every 30 minutes automatically.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Trigger Cron Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleTrigger}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Cron...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Trigger Cron Now
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Cron Completed Successfully!</p>
                  <p className="text-sm text-green-700">Stream counts have been updated</p>
                </div>
              </div>

              <div className="bg-white rounded border border-green-200 p-3 text-sm space-y-1">
                <p><span className="font-semibold">Users Processed:</span> {result.usersProcessed}</p>
                <p><span className="font-semibold">New Daily Streams (Any ATEEZ):</span> +{result.newDailyStreams}</p>
                <p><span className="font-semibold">New Daily Song Streams:</span> +{result.newDailySongStreams}</p>
                <p><span className="font-semibold">New Weekly Streams:</span> +{result.newWeeklyStreams}</p>
                <p><span className="font-semibold">Missions Count:</span> {result.missionsCount}</p>
                <p className="text-xs text-gray-500 pt-2">{result.timestamp}</p>
              </div>

              <p className="text-xs text-gray-600">
                💡 Refresh the streaming page to see updated community goals!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">⚠️ Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• This manually triggers the same job that runs every 30 minutes</p>
          <p>• Make sure goals are set before running (use /admin/goal, etc.)</p>
          <p>• The cron won't double-count - it tracks the last processed timestamp per user</p>
          <p>• Community goals will update immediately after running this</p>
        </CardContent>
      </Card>
    </div>
  )
}