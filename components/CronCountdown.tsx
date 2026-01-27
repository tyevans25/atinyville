"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CronCountdown() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      // Cron runs every 2 hours at the top of even hours (00:00, 02:00, 04:00, etc.)
      const now = new Date()
      const currentHour = now.getHours()
      
      // Calculate next even hour
      const nextCronHour = currentHour % 2 === 0 ? currentHour + 2 : currentHour + 1
      
      const nextRun = new Date()
      nextRun.setHours(nextCronHour, 0, 0, 0)
      
      // If we've passed the next run time somehow, add 2 more hours
      if (nextRun <= now) {
        nextRun.setHours(nextRun.getHours() + 2)
      }

      const diff = nextRun.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-white/20">
      <Clock className="w-4 h-4 text-blue-400" />
      <span className="text-sm text-gray-300">
        Streams update in: <span className="font-mono font-semibold text-white">{timeLeft}</span>
      </span>
    </div>
  )
}