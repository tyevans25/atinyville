"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CronCountdown() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const currentMinute = now.getMinutes()
      
      // Calculate next 30-minute mark
      const nextRun = new Date(now)
      if (currentMinute < 30) {
        nextRun.setMinutes(30, 0, 0)
      } else {
        nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0)
      }

      const diff = nextRun.getTime() - now.getTime()
      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${minutes}m ${seconds}s`)

      // AUTO-REFRESH when countdown hits 0
      if (minutes === 0 && seconds === 0) {
        setTimeout(() => {
          window.location.reload()
        }, 2000) // Wait 2 seconds for cron to complete
      }
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