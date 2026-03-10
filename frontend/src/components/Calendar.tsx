import { useEffect, useState } from 'react'

interface CalendarEvent {
  id?: string
  event_name: string
  event_time: string
  impact_rating?: string
  explanation?: string
  historical_pattern?: string
  watch_for?: string
}

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const from = new Date().toISOString().slice(0, 10)
      const to = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)
      const res = await fetch(`/api/calendar/events?from_date=${from}&to_date=${to}`)
      const json = await res.json()
      setEvents(json.events || [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const sync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/calendar/sync?use_ai=false', { method: 'POST' })
      await fetchEvents()
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const impactColor = (r?: string) => {
    const s = (r || '').toUpperCase()
    if (s === 'HIGH') return 'text-red-400'
    if (s === 'MEDIUM') return 'text-amber-400'
    return 'text-green-400'
  }

  const formatTime = (t: string) => {
    try {
      const d = new Date(t)
      return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    } catch {
      return t
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#e5e5e5]">Economic Calendar</h2>
        <button
          onClick={sync}
          disabled={syncing}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync from Massive'}
        </button>
      </div>

      {loading ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          No events. Sync from Massive to load.
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 15).map((e, i) => (
            <div
              key={e.id || i}
              className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium text-[#e5e5e5]">{e.event_name}</div>
                  <div className="mt-1 text-xs text-[#888]">{formatTime(e.event_time)}</div>
                  {e.explanation && (
                    <div className="mt-2 text-sm text-[#aaa]">{e.explanation}</div>
                  )}
                  {e.watch_for && (
                    <div className="mt-1 text-xs text-[#B8860B]">Watch: {e.watch_for}</div>
                  )}
                </div>
                <span className={`shrink-0 text-xs font-medium ${impactColor(e.impact_rating)}`}>
                  {e.impact_rating || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
