"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminGoal() {
  const [song, setSong] = useState("")
  const [target, setTarget] = useState(500)
  const [loading, setLoading] = useState(false)

  const setGoal = async () => {
    if (!song.trim()) {
      alert("Please enter a song name")
      return
    }

    if (!Number.isFinite(target) || target <= 0) {
      alert("Target must be a positive number")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("/api/daily-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song: song.trim(),
          target,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err?.error ?? "Failed to set goal")
        return
      }

      alert("✅ Daily goal set successfully!")
      setSong("")
    } catch (err) {
      console.error(err)
      alert("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Set Daily Goal</h1>

      <input
        placeholder="Song name"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        className="border p-2 w-full rounded"
      />

      <input
        type="number"
        min={1}
        step={1}
        placeholder="Target streams"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="border p-2 w-full rounded"
      />

      <Button
        onClick={setGoal}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Saving..." : "Set Goal"}
      </Button>
    </div>
  )
}
