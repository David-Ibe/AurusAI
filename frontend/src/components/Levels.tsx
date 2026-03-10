import { useEffect, useState } from 'react'

interface Level {
  id: string
  price: number
  type: string
  label?: string
  alert_threshold: number
  active: boolean
}

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [price, setPrice] = useState('')
  const [type, setType] = useState<'support' | 'resistance'>('resistance')
  const [label, setLabel] = useState('')

  const fetchLevels = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/levels?active_only=true')
      const json = await res.json()
      setLevels(json.levels || [])
    } catch {
      setLevels([])
    } finally {
      setLoading(false)
    }
  }

  const addLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseFloat(price)
    if (isNaN(p)) return
    try {
      await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: p, type, label: label || undefined }),
      })
      setPrice('')
      setLabel('')
      setShowForm(false)
      fetchLevels()
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#e5e5e5]">Key Levels</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10"
        >
          {showForm ? 'Cancel' : 'Add Level'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addLevel} className="mb-4 rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-24 rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'support' | 'resistance')}
              className="rounded border border-[#2a2a2a] bg-[#0D0D0D] px-2 py-1.5 text-sm text-[#e5e5e5]"
            >
              <option value="support">Support</option>
              <option value="resistance">Resistance</option>
            </select>
            <input
              type="text"
              placeholder="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
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

      {loading ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          Loading...
        </div>
      ) : levels.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          No levels. Add support/resistance to monitor.
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {levels.map((l) => (
            <div
              key={l.id}
              className={`rounded border p-3 ${
                l.type === 'resistance'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-green-500/30 bg-green-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-[#e5e5e5]">${Number(l.price).toFixed(2)}</span>
                  {l.label && <span className="ml-2 text-sm text-[#888]">{l.label}</span>}
                </div>
                <span className="text-xs text-[#888]">{l.type}</span>
              </div>
              <div className="mt-1 text-xs text-[#666]">Alert ±${l.alert_threshold}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
