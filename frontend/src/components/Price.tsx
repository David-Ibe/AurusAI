import { useEffect, useState } from 'react'

export default function Price() {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPrice = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/price')
      const json = await res.json()
      setPrice(json.price)
    } catch {
      setPrice(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, 60000)
    return () => clearInterval(id)
  }, [])

  if (loading && price === null) {
    return (
      <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center">
        <span className="text-[#888]">Loading XAU/USD...</span>
      </div>
    )
  }

  return (
    <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-[#888]">XAU/USD</div>
          <div className="text-3xl font-semibold text-[#B8860B]">
            {price != null ? `$${price.toFixed(2)}` : '—'}
          </div>
        </div>
        <button
          onClick={fetchPrice}
          disabled={loading}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
