import { useEffect, useState } from 'react'

interface MacroData {
  treasury_rates: Record<string, unknown>
  indicators: {
    gdp: Record<string, unknown>
    cpi: Record<string, unknown>
    unemployment: Record<string, unknown>
  }
}

export default function Macro() {
  const [data, setData] = useState<MacroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/macro')
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Failed to fetch')
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load macro data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formatVal = (v: unknown): string => {
    if (v == null) return '—'
    if (typeof v === 'number') return v.toFixed(2)
    return String(v)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-[#888]">Loading macro data...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#e5e5e5]">Macro Context</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Treasury rates */}
          {data.treasury_rates && Object.keys(data.treasury_rates).length > 0 && (
            <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <h3 className="mb-3 text-sm font-medium text-[#B8860B]">Treasury Rates</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {data.treasury_rates.date != null && (
                  <span className="text-[#888]">As of {String(data.treasury_rates.date)}</span>
                )}
                {data.treasury_rates.year2 != null && (
                  <span><strong className="text-[#e5e5e5]">2Y:</strong> {formatVal(data.treasury_rates.year2)}%</span>
                )}
                {data.treasury_rates.year5 != null && (
                  <span><strong className="text-[#e5e5e5]">5Y:</strong> {formatVal(data.treasury_rates.year5)}%</span>
                )}
                {data.treasury_rates.year10 != null && (
                  <span><strong className="text-[#e5e5e5]">10Y:</strong> {formatVal(data.treasury_rates.year10)}%</span>
                )}
                {data.treasury_rates.year30 != null && (
                  <span><strong className="text-[#e5e5e5]">30Y:</strong> {formatVal(data.treasury_rates.year30)}%</span>
                )}
              </div>
            </div>
          )}

          {/* Economic indicators */}
          <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <h3 className="mb-3 text-sm font-medium text-[#B8860B]">Key Indicators</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <IndicatorCard label="GDP" data={data?.indicators?.gdp} />
              <IndicatorCard label="CPI" data={data?.indicators?.cpi} />
              <IndicatorCard label="Unemployment" data={data?.indicators?.unemployment} />
            </div>
          </div>

          {(!data?.treasury_rates || Object.keys(data.treasury_rates).length === 0) &&
           (!data?.indicators?.gdp?.value && !data?.indicators?.cpi?.value && !data?.indicators?.unemployment?.value) && (
            <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
              No macro data available.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function IndicatorCard({ label, data }: { label: string; data?: Record<string, unknown> }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="rounded border border-[#2a2a2a] bg-[#0D0D0D] p-3">
        <div className="text-xs text-[#888]">{label}</div>
        <div className="mt-1 text-[#888]">—</div>
      </div>
    )
  }
  const value = data.value ?? data.val ?? data.close
  const date = data.date ?? data.period
  return (
    <div className="rounded border border-[#2a2a2a] bg-[#0D0D0D] p-3">
      <div className="text-xs text-[#888]">{label}</div>
      <div className="mt-1 font-medium text-[#e5e5e5]">
        {typeof value === 'number' ? value.toFixed(2) : String(value ?? '—')}
      </div>
      {date != null && date !== '' && <div className="mt-0.5 text-xs text-[#666]">{String(date)}</div>}
    </div>
  )
}
