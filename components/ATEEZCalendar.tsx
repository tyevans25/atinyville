"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ExternalLink, List } from 'lucide-react'
import { createPortal } from 'react-dom'

interface CalendarEvent {
  date: string
  timeKST?: string
  eventType: string
  title: string
  link: string
  description: string
  imageUrl?: string
  featuredMembers: string[]
}

const EVENT_COLORS: Record<string, {
  dot: string
  glow: string
  gradient: string
  badge: string
  badgeBorder: string
  badgeText: string
}> = {
  'Comeback':      { dot: '#ef4444', glow: 'rgba(239,68,68,0.4)',    gradient: 'linear-gradient(90deg,#ef4444,#f43f5e)', badge: 'rgba(239,68,68,0.15)',    badgeBorder: 'rgba(239,68,68,0.35)',    badgeText: '#f87171' },
  'Performance':   { dot: '#3b82f6', glow: 'rgba(59,130,246,0.4)',   gradient: 'linear-gradient(90deg,#3b82f6,#6366f1)', badge: 'rgba(59,130,246,0.15)',   badgeBorder: 'rgba(59,130,246,0.35)',   badgeText: '#60a5fa' },
  'Variety':       { dot: '#a855f7', glow: 'rgba(168,85,247,0.4)',   gradient: 'linear-gradient(90deg,#a855f7,#8b5cf6)', badge: 'rgba(168,85,247,0.15)',   badgeBorder: 'rgba(168,85,247,0.35)',   badgeText: '#c084fc' },
  'Concert':       { dot: '#ec4899', glow: 'rgba(236,72,153,0.4)',   gradient: 'linear-gradient(90deg,#ec4899,#f43f5e)', badge: 'rgba(236,72,153,0.15)',   badgeBorder: 'rgba(236,72,153,0.35)',   badgeText: '#f472b6' },
  'Special Event': { dot: '#eab308', glow: 'rgba(234,179,8,0.4)',    gradient: 'linear-gradient(90deg,#eab308,#f97316)', badge: 'rgba(234,179,8,0.15)',    badgeBorder: 'rgba(234,179,8,0.35)',    badgeText: '#facc15' },
  'Anniversary':   { dot: '#22c55e', glow: 'rgba(34,197,94,0.4)',    gradient: 'linear-gradient(90deg,#22c55e,#14b8a6)', badge: 'rgba(34,197,94,0.15)',    badgeBorder: 'rgba(34,197,94,0.35)',    badgeText: '#4ade80' },
  'Birthday':      { dot: '#f97316', glow: 'rgba(249,115,22,0.4)',   gradient: 'linear-gradient(90deg,#f97316,#eab308)', badge: 'rgba(249,115,22,0.15)',   badgeBorder: 'rgba(249,115,22,0.35)',   badgeText: '#fb923c' },
}

const MEMBER_COLORS: Record<string, { from: string; to: string }> = {
  'Hongjoong': { from: '#f97316', to: '#ef4444' },
  'Seonghwa':  { from: '#8b5cf6', to: '#6366f1' },
  'Yunho':     { from: '#3b82f6', to: '#06b6d4' },
  'Yeosang':   { from: '#10b981', to: '#14b8a6' },
  'San':       { from: '#ec4899', to: '#f43f5e' },
  'Mingi':     { from: '#f59e0b', to: '#f97316' },
  'Wooyoung':  { from: '#a855f7', to: '#ec4899' },
  'Jongho':    { from: '#06b6d4', to: '#3b82f6' },
  'ATEEZ':     { from: '#6366f1', to: '#8b5cf6' },
}

function getDisplayImage(event: CalendarEvent): string | undefined {
  if (event.imageUrl) return event.imageUrl
  if (event.link?.includes('youtube.com') || event.link?.includes('youtu.be')) {
    const youtubeId = event.link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )?.[1]
    if (youtubeId) return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
  }
  return undefined
}

function getEventColors(eventType: string) {
  return EVENT_COLORS[eventType] || {
    dot: '#6b7280', glow: 'rgba(107,114,128,0.3)',
    gradient: 'linear-gradient(90deg,#6b7280,#9ca3af)',
    badge: 'rgba(107,114,128,0.15)', badgeBorder: 'rgba(107,114,128,0.3)', badgeText: '#9ca3af'
  }
}

function getTimeInfo(date: string, timeKST?: string) {
  if (!timeKST) return null
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = timeKST.split(':').map(Number)
  const kstDate = new Date(Date.UTC(year, month - 1, day, hours, minutes))
  const utcDate = new Date(kstDate.getTime() - 9 * 60 * 60 * 1000)
  const kstDisplay = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} KST`
  const localTime = utcDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const localTZ = utcDate.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || ''
  const isDifferentDay = utcDate.toLocaleDateString('en-CA') !== date
  const localDateLabel = utcDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const kstDateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return { kstDisplay, localTime, localTZ, isDifferentDay, localDateLabel, kstDateLabel }
}

function MemberTag({ name }: { name: string }) {
  const colors = MEMBER_COLORS[name] || MEMBER_COLORS['ATEEZ']
  return (
    <span className="member-shimmer-tag" style={{
      padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
      border: `1px solid ${colors.from}55`, display: 'inline-block',
      backgroundImage: `linear-gradient(90deg, ${colors.from} 0%, #fff 40%, ${colors.to} 60%, ${colors.from} 100%)`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text', backgroundClip: 'text',
      WebkitTextFillColor: 'transparent', color: 'transparent',
    }}>
      {name}
    </span>
  )
}

const MEMBER_INITIALS: Record<string, string> = {
  'Hongjoong': 'HJ', 'Seonghwa': 'SH', 'Yunho': 'YH', 'Yeosang': 'YS',
  'San': 'SN', 'Mingi': 'MG', 'Wooyoung': 'WY', 'Jongho': 'JH', 'ATEEZ': 'OT8',
}

function MemberInitial({ name }: { name: string }) {
  const colors = MEMBER_COLORS[name] || MEMBER_COLORS['ATEEZ']
  const initial = MEMBER_INITIALS[name] || MEMBER_INITIALS['ATEEZ']
  return (
    <div title={name} style={{
      width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 6, fontWeight: 800, color: 'white',
      boxShadow: `0 0 4px ${colors.from}88`
    }}>
      {initial}
    </div>
  )
}

function EventModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const c = getEventColors(event.eventType)
  const timeInfo = getTimeInfo(event.date, event.timeKST)
  const members = event.featuredMembers || []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{ background: c.glow, filter: 'blur(140px)', opacity: 0.25 }} />

      <div className="relative w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="absolute -inset-[2px] rounded-2xl opacity-80" style={{
          background: `linear-gradient(90deg, ${c.dot}, #8b5cf6, #ec4899, #8b5cf6, ${c.dot})`,
          backgroundSize: '200% 100%',
          animation: 'calendarGradientShift 3s linear infinite'
        }} />

        <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0d1117' }}>
          <div style={{ height: 2, width: '100%', background: c.gradient }} />

          {getDisplayImage(event) && (
            <div className="relative overflow-hidden" style={{ height: 190 }}>
              <img src={getDisplayImage(event)} alt="" aria-hidden style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', filter: 'blur(20px) saturate(1.4) brightness(0.45)',
                transform: 'scale(1.1)'
              }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,17,23,0.4)' }} />
              <img src={getDisplayImage(event)!} alt={event.title} style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'contain', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.8))'
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
                background: 'linear-gradient(to bottom, transparent, #0d1117)'
              }} />
            </div>
          )}

          <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: c.dot }} />
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '2px 8px', borderRadius: 999,
                  background: c.badge, border: `1px solid ${c.badgeBorder}`, color: c.badgeText
                }}>
                  {event.eventType}
                </span>
              </div>
              {members.length > 0 && (
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
              )}
              <div className="flex items-center gap-1 flex-wrap">
                {members.map(m => <MemberTag key={m} name={m} />)}
              </div>
            </div>
            <button onClick={onClose}
              className="text-gray-600 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-sm flex-shrink-0">
              ✕
            </button>
          </div>

          <div className="px-5 pb-4">
            <h3 style={{ color: '#e6edf3', fontSize: 17, fontWeight: 900, margin: 0, lineHeight: 1.3 }}>{event.title}</h3>
          </div>

          <div className="px-5 pb-5 space-y-3">
            {timeInfo ? (
              <div className="rounded-xl overflow-hidden border border-white/5"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="px-4 py-2 flex items-center gap-2 border-b border-white/5"
                  style={{ background: `linear-gradient(90deg, ${c.dot}18, transparent)` }}>
                  <span className="text-[10px]">📅</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>{timeInfo.kstDateLabel}</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-white/5">
                  <div className="px-4 py-3">
                    <p style={{ color: '#484f58', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Korea (KST)</p>
                    <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>{timeInfo.kstDisplay}</p>
                    <p style={{ color: '#484f58', fontSize: 10, margin: 0 }}>Seoul, South Korea</p>
                  </div>
                  <div className="px-4 py-3" style={{ background: `${c.dot}0f` }}>
                    <p style={{ color: '#484f58', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Your Time</p>
                    <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15, margin: '0 0 2px' }}>
                      {timeInfo.localTime} <span style={{ color: '#8b949e', fontSize: 11, fontWeight: 400 }}>{timeInfo.localTZ}</span>
                    </p>
                    {timeInfo.isDifferentDay ? (
                      <div className="mt-1">
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(251,191,36,0.15)', color: '#fbbf24',
                          border: '1px solid rgba(251,191,36,0.3)'
                        }}>⚠ {timeInfo.localDateLabel}</span>
                      </div>
                    ) : (
                      <p style={{ color: c.dot, fontSize: 10, margin: 0 }}>Same date as KST</p>
                    )}
                  </div>
                </div>
                {timeInfo.isDifferentDay && (
                  <div className="px-4 py-2 border-t border-white/5 flex items-start gap-2"
                    style={{ background: 'rgba(251,191,36,0.05)' }}>
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>⚠</span>
                    <p style={{ color: 'rgba(251,191,36,0.8)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                      This event falls on a <strong style={{ color: '#fbbf24' }}>different date</strong> in your timezone than in Korea.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl px-4 py-3 border border-white/5 flex items-center gap-2"
                style={{ background: `linear-gradient(90deg, ${c.dot}18, transparent)` }}>
                <span className="text-sm">📅</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>
                  {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {event.description && (
              <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{event.description}</p>
            )}

            {event.link && (
              <a href={event.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: c.gradient, boxShadow: `0 4px 20px ${c.glow}`, textDecoration: 'none' }}>
                Watch / View <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ATEEZCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar-events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events || [])
      }
    } catch (e) {
      console.error('Error fetching events:', e)
    } finally {
      setLoading(false)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingDay = new Date(year, month, 1).getDay()
  const todayString = new Date().toLocaleDateString('en-CA')
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const getEventsForDate = (day: number): CalendarEvent[] => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === d)
  }

  const upcomingEvents = events
    .filter(e => e.date >= todayString)
    .sort((a, b) => {
      const dc = a.date.localeCompare(b.date)
      return dc !== 0 ? dc : (a.timeKST || '').localeCompare(b.timeKST || '')
    })
    .slice(0, 10)

  const calendarDays: (number | null)[] = [
    ...Array(startingDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: '#8b949e', fontSize: 13 }}>Loading calendar...</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'rgba(22,32,56,0.85)' }} className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 700 }} className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400 flex-shrink-0" />
          ATEEZ Calendar
        </h2>
        <p style={{ color: '#484f58', fontSize: 12 }}>Times in your local timezone</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Calendar Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="p-1.5 hover:bg-white/10 rounded-lg transition">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <h3 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 700 }}>{monthNames[month]} {year}</h3>
              <button onClick={() => setCurrentDate(new Date())}
                style={{ background: '#58a6ff', color: 'white', fontSize: 11, fontWeight: 700 }}
                className="px-2 py-0.5 rounded transition">
                Today
              </button>
            </div>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="p-1.5 hover:bg-white/10 rounded-lg transition">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map((d, i) => (
              <div key={i} style={{ color: '#484f58', fontSize: 10, fontWeight: 700 }} className="text-center py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} className="min-h-[64px]" />
              const dayEvents = getEventsForDate(day)
              const hasEvents = dayEvents.length > 0
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateString === todayString
              const isPast = dateString < todayString

              return (
                <button
                  key={day}
                  onClick={() => hasEvents && setSelectedEvent(dayEvents[0])}
                  className="min-h-[64px] rounded-lg p-1 flex flex-col text-left transition-all"
                  style={{
                    border: isToday ? '1px solid #3b82f6' : hasEvents ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
                    background: isToday ? 'rgba(59,130,246,0.12)' : hasEvents ? 'rgba(255,255,255,0.04)' : 'transparent',
                    cursor: hasEvents ? 'pointer' : 'default',
                    opacity: isPast && !isToday ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: isToday ? '#60a5fa' : hasEvents ? '#e6edf3' : '#484f58'
                  }} className="self-end px-0.5">
                    {day}
                  </span>

                  <div className="flex flex-col gap-0.5 w-full mt-0.5">
                    {dayEvents.slice(0, 2).map((event, i) => {
                      const ec = getEventColors(event.eventType)
                      return (
                        <div key={i}
                          onClick={e => { e.stopPropagation(); setSelectedEvent(event) }}
                          style={{
                            width: '100%', borderRadius: 5, padding: '2px 4px',
                            background: `linear-gradient(90deg, ${ec.dot}cc, ${ec.dot}77)`,
                            border: `1px solid ${ec.dot}44`,
                          }}>
                          <p style={{
                            color: 'white', fontSize: 8, fontWeight: 700, margin: 0,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3
                          }}>
                            {event.title}
                          </p>
                          {event.featuredMembers?.length > 0 && (
                            <div style={{ display: 'flex', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
                              {event.featuredMembers.slice(0, 3).map(m => (
                                <MemberInitial key={m} name={m} />
                              ))}
                              {event.featuredMembers.length > 3 && (
                                <div style={{
                                  width: 13, height: 13, borderRadius: '50%',
                                  background: 'rgba(255,255,255,0.2)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 6, color: 'white', fontWeight: 800
                                }}>+{event.featuredMembers.length - 3}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {dayEvents.length > 2 && (
                      <span style={{ fontSize: 8, color: '#484f58', paddingLeft: 3 }}>
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>

                  {isToday && (
                    <div style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#60a5fa', margin: '2px auto 0'
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(EVENT_COLORS).map(([type, c]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
                <span style={{ fontSize: 10, color: '#484f58' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Upcoming Schedule */}
        <div>
          <h3 style={{ color: '#e6edf3', fontSize: 14, fontWeight: 700 }} className="mb-3 flex items-center gap-2">
            <List className="w-4 h-4 text-blue-400" />
            Upcoming Schedule
          </h3>

          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#484f58', fontSize: 13 }} className="text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {upcomingEvents.map((event, i) => {
                const ec = getEventColors(event.eventType)
                const timeInfo = getTimeInfo(event.date, event.timeKST)
                const isToday = event.date === todayString
                const isTomorrow = event.date === new Date(Date.now() + 86400000).toLocaleDateString('en-CA')
                const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' :
                  new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })

                return (
                  <button key={i} onClick={() => setSelectedEvent(event)}
                    className="w-full text-left rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${ec.dot}22`,
                      display: 'flex', gap: 10, alignItems: 'flex-start'
                    }}>
                    <div style={{
                      width: 3, borderRadius: 2, alignSelf: 'stretch', flexShrink: 0,
                      background: `linear-gradient(to bottom, ${ec.dot}, ${ec.dot}44)`
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
                          background: isToday ? '#58a6ff' : 'rgba(255,255,255,0.08)',
                          color: isToday ? 'white' : '#8b949e'
                        }}>{dateLabel}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: ec.dot, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {event.eventType}
                        </span>
                      </div>
                      <p style={{
                        color: '#e6edf3', fontSize: 13, fontWeight: 600, margin: '0 0 4px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {event.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {timeInfo && (
                          <span style={{ color: '#8b949e', fontSize: 11 }}>
                            🕐 {timeInfo.localTime} {timeInfo.localTZ}
                            {timeInfo.isDifferentDay && (
                              <span style={{ color: '#fbbf24', marginLeft: 4 }}>⚠ {timeInfo.localDateLabel}</span>
                            )}
                          </span>
                        )}
                        {event.featuredMembers?.length > 0 && (
                          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            {event.featuredMembers.slice(0, 4).map(m => <MemberInitial key={m} name={m} />)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && typeof document !== 'undefined' && createPortal(
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />,
        document.body
      )}

      <style>{`
        @keyframes calendarGradientShift {
          0%   { background-position: 0%   50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes calendarShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .member-shimmer-tag {
          animation: calendarShimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}