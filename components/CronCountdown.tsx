"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export default function CronCountdown() {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      // Cron fires at :00/:15/:30/:45 and takes ~5 min to process.
      // Count to the actual update marks: :05/:20/:35/:50
      const PROCESSING_OFFSET = 5 * 60 // seconds
      const CYCLE = 15 * 60            // seconds
      const totalSeconds = now.getMinutes() * 60 + now.getSeconds()
      const adjustedSeconds = ((totalSeconds - PROCESSING_OFFSET) + 3600) % CYCLE
      const secondsUntilUpdate = adjustedSeconds === 0 ? 0 : CYCLE - adjustedSeconds

      const minutes = Math.floor(secondsUntilUpdate / 60)
      const seconds = secondsUntilUpdate % 60

      setTimeLeft(`${minutes}m ${seconds}s`)

      // AUTO-REFRESH right when the update mark hits
      if (minutes === 0 && seconds === 0) {
        setTimeout(() => {
          window.location.reload()
        }, 3000)
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