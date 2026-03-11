import Panel from './Panel';
import ImpactDot from '../ui/ImpactDot';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useNews } from '../../hooks/useNews';
import { formatWATShort } from '../../lib/formatters';

function scoreToImpact(score: number): 'HIGH' | 'MED' | 'LOW' {
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MED';
  return 'LOW';
}

export default function NewsPanel() {
  const { data: newsData, isLoading, error } = useNews(10);

  const news = newsData ?? [];

  if (error) {
    return (
      <Panel title="NEWS INTELLIGENCE">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel title="NEWS INTELLIGENCE">
        <div className="space-y-3">
          <SkeletonBlock height="48px" />
          <SkeletonBlock height="48px" />
        </div>
      </Panel>
    );
  }

  if (news.length === 0) {
    return (
      <Panel title="NEWS INTELLIGENCE">
        <p className="font-sans text-sm font-medium text-[var(--text2)]">
          No news. Sync news to load.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="NEWS INTELLIGENCE">
      <div className="max-h-64 space-y-3 overflow-y-auto">
        {news.map((item) => {
          const impact = scoreToImpact(item.impact_score ?? 5);
          return (
            <div
              key={item.id ?? item.headline}
              className="rounded p-2 transition-colors hover:bg-[rgba(251,191,36,0.08)]"
            >
              <div className="flex items-start gap-2">
                <ImpactDot impact={impact} />
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium leading-relaxed text-[var(--text)]">
                    {item.headline}
                  </p>
                  <p className="mt-1 font-mono text-xs font-medium text-[var(--text3)]">
                    {item.source || '—'} · {formatWATShort(item.published_at)}
                  </p>
                  {item.impact_assessment && (
                    <p
                      className="mt-1 font-sans text-sm italic"
                      style={{ color: 'var(--text2)' }}
                    >
                      {item.impact_assessment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
