import { useEffect, useState } from 'react'

interface TradeCreate {
  entry_price: number
  direction: 'long' | 'short'
  lot_size?: number
  session?: string
  setup_description?: string
}

interface Trade {
  id: string
  entry_price: number
  exit_price?: number
  direction: string
  outcome: string
  session?: string
  pnl_dollars?: number
  entry_time?: string
  setup_description?: string
}

interface Insights {
  best_setup?: string
  weak_setup?: string
  session_performance?: string
  news_day_impact?: string
  recommendations?: string[]
  trade_count?: number
}

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<TradeCreate>({
    entry_price: 0,
    direction: 'long',
    lot_size: 0.01,
    session: 'london',
  })

  const fetchTrades = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/trades')
      const json = await res.json()
      setTrades(json.trades || [])
    } catch {
      setTrades([])
    } finally {
      setLoading(false)
    }
  }

  const addTrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.entry_price || form.entry_price <= 0) return
    try {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setShowForm(false)
      fetchTrades()
    } catch {
      // ignore
    }
  }

  const fetchInsights = async () => {
    setInsightsLoading(true)
    try {
      const res = await fetch('/api/trades/insights')
      const json = await res.json()
      setInsights(json)
    } catch {
      setInsights(null)
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
  }, [])

  const outcomeColor = (o: string) => {
    if (o === 'win') return 'text-green-400'
    if (o === 'loss') return 'text-red-400'
    if (o === 'breakeven') return 'text-amber-400'
    return 'text-[#888]'
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#e5e5e5]">Trade Journal</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10"
          >
            {showForm ? 'Cancel' : 'Add Trade'}
          </button>
          <button
          onClick={fetchInsights}
          disabled={insightsLoading}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
        >
          {insightsLoading ? 'Loading...' : 'Get Insights'}
        </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={addTrade} className="mb-4 rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Entry price"
              value={form.entry_price || ''}
              onChange={(e) => setForm({ ...form, entry_price: parseFloat(e.target.value) || 0 })}
              className="w-24 rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            />
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value as 'long' | 'short' })}
              className="rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Lot size"
              value={form.lot_size || ''}
              onChange={(e) => setForm({ ...form, lot_size: parseFloat(e.target.value) || undefined })}
              className="w-20 rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            />
            <select
              value={form.session}
              onChange={(e) => setForm({ ...form, session: e.target.value })}
              className="rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            >
              <option value="london">London</option>
              <option value="new_york">New York</option>
              <option value="asian">Asian</option>
              <option value="overlap">Overlap</option>
            </select>
            <input
              type="text"
              placeholder="Setup (optional)"
              value={form.setup_description || ''}
              onChange={(e) => setForm({ ...form, setup_description: e.target.value || undefined })}
              className="w-32 rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            />
            <button
              type="submit"
              className="rounded bg-[#B8860B] px-3 py-1.5 text-sm text-[#0D0D0D] hover:bg-[#B8860B]/90"
            >
              Add
            </button>
          </div>
        </form>
      )}

      {insights && (
        <div className="mb-4 rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <h3 className="mb-2 text-sm font-medium text-[#B8860B]">Post-Trade Intelligence</h3>
          {insights.trade_count != null && (
            <div className="mb-2 text-xs text-[#888]">Based on {insights.trade_count} closed trades</div>
          )}
          {insights.best_setup && (
            <p className="text-sm text-[#e5e5e5]"><strong>Best:</strong> {insights.best_setup}</p>
          )}
          {insights.weak_setup && (
            <p className="mt-1 text-sm text-[#e5e5e5]"><strong>Weak:</strong> {insights.weak_setup}</p>
          )}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-[#aaa]">
              {insights.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {loading ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          Loading trades...
        </div>
      ) : trades.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          No trades yet. Add a trade above.
        </div>
      ) : (
        <div className="space-y-2">
          {trades.slice(0, 20).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4"
            >
              <div>
                <div className="font-medium text-[#e5e5e5]">
                  {t.direction.toUpperCase()} @ ${Number(t.entry_price).toFixed(2)}
                  {t.exit_price != null && ` → $${Number(t.exit_price).toFixed(2)}`}
                </div>
                <div className="mt-1 flex gap-2 text-xs text-[#888]">
                  {t.session && <span>{t.session}</span>}
                  {t.setup_description && <span>• {t.setup_description}</span>}
                </div>
              </div>
              <div className="text-right">
                <span className={outcomeColor(t.outcome)}>{t.outcome}</span>
                {t.pnl_dollars != null && (
                  <div className={`text-sm ${t.pnl_dollars >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${t.pnl_dollars >= 0 ? '+' : ''}{t.pnl_dollars.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
