import { useState } from 'react';
import Panel from '../components/panels/Panel';
import ImpactDot from '../components/ui/ImpactDot';
import SkeletonBlock from '../components/ui/SkeletonBlock';
import { useNews } from '../hooks/useNews';
import { syncNews } from '../lib/api';
import { formatWATShort } from '../lib/formatters';

function scoreToImpact(score: number): 'HIGH' | 'MED' | 'LOW' {
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MED';
  return 'LOW';
}

export default function News() {
  const [syncing, setSyncing] = useState(false);
  const [minImpact, setMinImpact] = useState<number | null>(null);

  const { data: newsData, isLoading, error, refetch } = useNews(30, minImpact ?? undefined);
  const news = newsData ?? [];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncNews(true, 30);
      refetch();
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Panel title="NEWS INTELLIGENCE">
          <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
            Feed unavailable.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title="NEWS INTELLIGENCE">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setMinImpact(null)}
              className={`rounded px-2 py-1 font-mono text-sm font-medium uppercase ${
                minImpact == null
                  ? 'border border-[var(--gold)] bg-[rgba(251,191,36,0.12)] text-[var(--gold)]'
                  : 'border border-[var(--border)] bg-transparent text-[var(--text2)] hover:border-[var(--gold-dim)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setMinImpact(7)}
              className={`rounded px-2 py-1 font-mono text-sm font-medium uppercase ${
                minImpact === 7
                  ? 'border border-[var(--red)] bg-[rgba(231,76,60,0.12)] text-[var(--red)]'
                  : 'border border-[var(--border)] bg-transparent text-[var(--text2)] hover:border-[var(--gold-dim)]'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setMinImpact(4)}
              className={`rounded px-2 py-1 font-mono text-sm font-medium uppercase ${
                minImpact === 4
                  ? 'border border-[var(--amber)] bg-[rgba(243,156,18,0.12)] text-[var(--amber)]'
                  : 'border border-[var(--border)] bg-transparent text-[var(--text2)] hover:border-[var(--gold-dim)]'
              }`}
            >
              Med+
            </button>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded border border-[var(--gold)] bg-transparent px-3 py-1.5 font-mono text-sm font-medium text-[var(--gold)] hover:bg-[rgba(212,148,58,0.1)] disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonBlock height="64px" />
            <SkeletonBlock height="64px" />
            <SkeletonBlock height="64px" />
          </div>
        ) : news.length === 0 ? (
          <p className="font-sans text-xs text-[var(--text2)]">
            No news. Click <strong>Sync</strong> to fetch.
          </p>
        ) : (
          <div className="space-y-3">
            {news.map((item) => {
              const impact = scoreToImpact(item.impact_score ?? 5);
              return (
                <a
                  key={item.id ?? item.headline}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded border border-[var(--border)] p-3 transition-colors hover:bg-[rgba(251,191,36,0.06)] hover:border-[rgba(251,191,36,0.25)]"
                >
                  <div className="flex items-start gap-2">
                    <ImpactDot impact={impact} />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[12px] leading-relaxed text-[var(--text)]">
                        {item.headline}
                      </p>
                      <p className="mt-1 font-mono text-xs font-medium text-[var(--text3)]">
                        {item.source || '—'} · {formatWATShort(item.published_at)}
                      </p>
                      {item.impact_assessment && (
                        <p
                          className="mt-2 font-sans text-sm font-medium italic"
                          style={{ color: 'var(--text2)' }}
                        >
                          {item.impact_assessment}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
