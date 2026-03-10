import { useEffect, useState } from 'react'

interface NewsItem {
  id?: string
  headline: string
  source?: string
  url?: string
  published_at?: string
  impact_score?: number
  impact_assessment?: string
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news?limit=15')
      const json = await res.json()
      setNews(json.news || [])
    } catch {
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const sync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/news/sync?use_ai=true&limit=15', { method: 'POST' })
      await fetchNews()
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const impactColor = (s?: number) => {
    if (!s) return 'text-[#888]'
    if (s >= 7) return 'text-red-400'
    if (s >= 5) return 'text-amber-400'
    return 'text-green-400'
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#e5e5e5]">News</h2>
        <button
          onClick={sync}
          disabled={syncing}
          className="rounded border border-[#B8860B] bg-transparent px-3 py-1.5 text-sm text-[#B8860B] hover:bg-[#B8860B]/10 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      {loading ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          Loading news...
        </div>
      ) : news.length === 0 ? (
        <div className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-6 text-center text-[#888]">
          No news. Sync to load.
        </div>
      ) : (
        <div className="space-y-2">
          {news.map((n, i) => (
            <div
              key={n.id || i}
              className="rounded border border-[#2a2a2a] bg-[#1a1a1a] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#e5e5e5] hover:text-[#B8860B]"
                  >
                    {n.headline}
                  </a>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#888]">
                    {n.source && <span>{n.source}</span>}
                    {n.impact_assessment && (
                      <span className="text-[#aaa]">• {n.impact_assessment}</span>
                    )}
                  </div>
                </div>
                {n.impact_score != null && (
                  <span className={`shrink-0 text-sm font-medium ${impactColor(n.impact_score)}`}>
                    {n.impact_score}/10
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
