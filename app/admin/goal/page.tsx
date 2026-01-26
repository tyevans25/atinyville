"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminGoal() {
  const [song, setSong] = useState("")
  const [target, setTarget] = useState(500)

  const setGoal = async () => {
    const res = await fetch('/api/daily-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ song, target })
    })
    
    if (res.ok) alert('Goal set!')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Set Daily Goal</h1>
      <input
        placeholder="Song name"
        value={song}
        onChange={(e) => setSong(e.target.value)}
        className="border p-2 mb-2"
      />
      <input
        type="number"
        placeholder="Target streams"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
        className="border p-2 mb-2"
      />
      <Button onClick={setGoal}>Set Goal</Button>
    </div>
  )
}