"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export default function StationheadLiveBanner() {
  return (
    <Card className="glass-card border-pink-500/50 animate-pulse mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white font-bold text-lg">🎉 Stationhead Party - Stream Together!</p>
              <p className="text-gray-300 text-sm">Join fellow ATINYs streaming together</p>
            </div>
          </div>
          <Button
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => window.open('https://stationhead.com/atinytown', '_blank')}
          >
            <Radio className="w-4 h-4 mr-2" />
            Join Party
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
