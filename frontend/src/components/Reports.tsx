import { useEffect, useState } from 'react'

interface Report {
  id: string
  content: Record<string, unknown>
  delivered_at?: string
  week_start?: string
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<'daily' | 'weekly' | null>(null)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reports?limit=10')
      const json = await res.json()
      setReports(json.reports || [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const generate = async (type: 'daily' | 'weekly') => {
    setGenerating(type)
    try {
      const path = type === 'daily' ? '/api/reports/daily' : '/api/reports/weekly'
      await fetch(path, { method: 'POST' })
      await fetchReports()
    } finally {
      setGenerating(null)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const renderValue = (v: unknown) => {
    if (v == null) return '—'
    if (Array.isArray(v)) {
      return (
        <ul className="ml-4 list-disc">
          {v.map((item, i) => (
            <li key={i}>{renderValue(item)}</li>
          ))}
        </ul>
      )
    }
    if (typeof v === 'object') {
      const obj = v as Record<string, unknown>
      return (
        <span className="text-[#e5e5e5]">
          {Object.entries(obj)
            .filter(([, val]) => val != null)
            .map(([key, val]) => `${key.replace(/_/g, ' ')}: ${typeof val === 'number' ? '$' + val.toFixed(2) : val}`)
            .join(', ')}
        </span>
      )
    }
    return <span className="text-[#e5e5e5]">{String(v)}</span>
  }

  const renderContent = (c: Record<string, unknown>) => {
    if (!c) return null
    const entries = Object.entries(c).filter(([k]) => !['error'].includes(k))
    return (
      <div className="space-y-2 text-sm">
        {entries.map(([k, v]) => (
          <div key={k}>
            <span className="text-[#B8860B]">{k.replace(/_/g, ' ')}:</span>{' '}
            {renderValue(v)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-[#e5e5e5]">Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={() => generate('daily')}
            disabled={!!generating}
            className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
          >
            {generating === 'daily' ? 'Generating...' : 'Daily Brief'}
          </button>
          <button
            onClick={() => generate('weekly')}
            disabled={!!generating}
            className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
          >
            {generating === 'weekly' ? 'Generating...' : 'Weekly Report'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          No reports. Generate a daily brief or weekly report.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-[#888]">
                {r.week_start && <span>Week: {r.week_start}</span>}
                {r.delivered_at && (
                  <span>{new Date(r.delivered_at).toLocaleString()}</span>
                )}
              </div>
              {renderContent(r.content || {})}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
