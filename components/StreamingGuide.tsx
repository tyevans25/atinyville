"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, Volume2, BarChart3, Users, Smartphone, Check, X } from "lucide-react"

export default function StreamingGuideButton() {
    const [open, setOpen] = useState(false)

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                className="w-full glass-card border-white/30 text-white hover:bg-white/20 backdrop-blur-xl transition-all"
            >
                <BookOpen className="w-4 h-4 mr-2" />
                Streaming Guide
            </Button>
        )
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-gray-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                ATEEZ Streaming Guide 🏴‍☠️
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Everything you need to know to support ATEEZ effectively
                            </p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    ß
                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Section 1: Why Stream */}
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                Why Streaming Matters
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-gray-300">
                                    Streaming helps ATEEZ in multiple ways:
                                </p>
                                <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Chart positions on Billboard, Melon, and other platforms</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Increases visibility and algorithm recommendations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span>Shows support for music show wins and awards</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2: How to Stream Effectively */}
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-purple-400" />
                                Effective Streaming Tips
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-2">✅ DO:</h4>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Listen at 50%+ volume</li>
                                        <li>• Make playlists 1-2 hours long</li>
                                        <li>• Stream for at least 30 seconds</li>
                                        <li>• Mix in other artists&apos; songs</li>
                                        <li>• Use different devices/accounts</li>
                                        <li>• Pause, skip and take breaks</li>
                                    </ul>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-2">❌ DON&apos;T:</h4>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                        <li>• Mute the audio</li>
                                        <li>• Loop the same song endlessly</li>
                                        <li>• Use VPNs (can flag as spam)</li>
                                        <li>• Skip songs repeatedly</li>
                                        <li>• Use bots or automation</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Details */}
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-green-400" />
                                Detailed Tips
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Non-ATEEZ Songs</h4>
                                    <p className="text-sm text-gray-300">
                                        <li>• It is encouraged to set your playlists up to be similar to your usual listening habits.</li>
                                        <li>• You can add ATEEZ songs not part of the new release as well. Take your personal listening habits into consideration when creating playlists.</li>
                                        <li>• If you listen to ATEEZ songs often, adding in more ATEEZ filler songs is fine. If you tend to listen to many non-ATEEZ artists, considering add more of them as fillers in you playlists with a few ATEEZ fillers.</li>
                                        <li>• Try not to include non-ATEEZ songs that were recently released for charting purposes.</li>
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Spacing</h4>
                                    <p className="text-sm text-gray-300">
                                        <li>• Playlists should be around 1-2 hours long, with varying number of filler songs.</li>
                                        <li>• Spacing should be roughly 1-7 filler songd between focus songs (new releases).</li>
                                        <li>• Don't hesitate to have a focus song back to back once or twice. That is still normal behaviour.</li>

                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Prioritise Manual Streaming</h4>
                                    <p className="text-sm text-gray-300">
                                        <li>• Search for ATEEZ songs and albums on the platforms.</li>
                                        <li>• If you're unable to stream manually, join Stationhead streaming parties.</li>
                                        <li>• Change up the way you stream.</li>
                                        <li>• In addition to personal playlists, use offical playlisting from the platforms that the new release is on.</li>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 text-center mt-4">
                                        Be sure to check out our ATINY streaming accounts for more tips and updates!
                                        @9024fm @atz_playlist @ateezrendezvous @AtzBluebirdFM on X
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Stationhead */}
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-pink-400" />
                                Stationhead Group Streaming
                            </h3>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-gray-300">
                                    Join group streaming sessions on Stationhead to maximize impact:
                                </p>
                                <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                    <li>• Download the Stationhead app</li>
                                    <li>• Connect your Spotify/Apple Music account</li>
                                    <li>• Join ATEEZ streaming parties </li>
                                    <li>• Your streams count + community engagement</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 5: Track Your Progress */}
                        <section>
                            <h3 className="text-lg font-semibold text-white mb-3">
                                📊 Track Your Streams
                            </h3>
                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-sm text-gray-300">
                                    Link your stats.fm account on this page to track your personal streaming stats and contribute to community goals!
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-900 border-t border-white/10 p-4 flex justify-end">
                        <Button
                            onClick={() => setOpen(false)}
                            className="bg-white hover:bg-gray-200 text-gray-800"
                        >
                            Got it!
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
