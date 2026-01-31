"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radio } from "lucide-react"

export default function StationheadLiveBanner() {
  return (
    <Card className="glass-card border-red-500/50 animate-pulse mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-white font-bold text-lg">🎉 Stationhead Party LIVE NOW!</p>
              <p className="text-gray-300 text-sm">Join fellow ATINYs streaming together</p>
            </div>
          </div>
          <a
            href="/stationhead"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-red-500 hover:bg-red-600 text-white">
              <Radio className="w-4 h-4 mr-2" />
              Join Party
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}