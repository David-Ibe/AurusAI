import { useState } from 'react';
import Panel from '../components/panels/Panel';
import { fetchTradeInsights } from '../lib/api';

export default function Insights() {
  const [insights, setInsights] = useState<Awaited<ReturnType<typeof fetchTradeInsights>> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTradeInsights();
      setInsights(data);
    } catch {
      setError('Failed to fetch insights.');
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Panel title="TRADE INSIGHTS">
        <p className="mb-4 font-sans text-xs text-[var(--text2)]">
          AI-analyzed performance patterns from your trade journal. Requires at least 5 closed
          trades.
        </p>
        <button
          onClick={handleFetch}
          disabled={loading}
          className="rounded border border-[var(--gold)] bg-transparent px-4 py-2 font-mono text-[11px] text-[var(--gold)] hover:bg-[rgba(212,148,58,0.1)] disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Get Insights'}
        </button>

        {error && (
          <div className="mt-4 rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
            {error}
          </div>
        )}

        {insights && !loading && (
          <div className="mt-4 space-y-4 font-sans text-sm">
            {insights.trade_count != null && insights.trade_count > 0 && (
              <p className="text-[var(--text3)]">
                Based on {insights.trade_count} closed trades
              </p>
            )}

            {insights.best_setup && (
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--green)]">Best</span>
                <p className="mt-1 text-[var(--text)]">{insights.best_setup}</p>
              </div>
            )}

            {insights.weak_setup && (
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--red)]">Weak</span>
                <p className="mt-1 text-[var(--text)]">{insights.weak_setup}</p>
              </div>
            )}

            {insights.session_performance && (
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--text2)]">Session</span>
                <p className="mt-1 text-[var(--text)]">{insights.session_performance}</p>
              </div>
            )}

            {insights.news_day_impact && (
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--text2)]">News days</span>
                <p className="mt-1 text-[var(--text)]">{insights.news_day_impact}</p>
              </div>
            )}

            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <span className="font-mono text-[10px] uppercase text-[var(--gold)]">
                  Recommendations
                </span>
                <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--text)]">
                  {insights.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.insights &&
              !insights.best_setup &&
              !insights.weak_setup &&
              insights.recommendations?.length === 0 && (
                <p className="text-[var(--text)]">{insights.insights}</p>
              )}
          </div>
        )}
      </Panel>
    </div>
  );
}
