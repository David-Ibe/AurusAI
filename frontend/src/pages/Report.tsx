import { useState } from 'react';
import Panel from '../components/panels/Panel';
import { useReports } from '../hooks/useReports';
import { triggerDailyBrief, triggerWeeklyReport } from '../lib/api';
import type { Report } from '../lib/api';

function formatReportDate(d: string | null | undefined) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

type ReportContent = Record<string, unknown> & {
  week_summary?: string;
  major_drivers?: string[];
  technical_picture?: string;
  important_news?: string[];
  upcoming_catalysts?: string[];
  key_levels?: { resistance?: number; support?: number };
  trade_setup_ideas?: string[];
  gold_price?: string;
  macro_context?: string;
  bias?: string;
  events_today?: string[];
  note?: string;
};

export default function Report() {
  const { data: reportsData, isLoading, error, refetch } = useReports(20);
  const reports = reportsData ?? [];

  const weeklyReports = reports.filter((r) => r.week_start) as (Report & { week_start: string })[];
  const dailyReports = reports.filter((r) => !r.week_start);

  const [generating, setGenerating] = useState<'daily' | 'weekly' | null>(null);

  const handleGenerateDaily = async () => {
    setGenerating('daily');
    try {
      await triggerDailyBrief();
      refetch();
    } catch {
      // ignore
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateWeekly = async () => {
    setGenerating('weekly');
    try {
      await triggerWeeklyReport();
      refetch();
    } catch {
      // ignore
    } finally {
      setGenerating(null);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Panel title="WEEKLY REPORT">
          <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
            Failed to load reports.
          </div>
        </Panel>
      </div>
    );
  }

  const renderWeeklyContent = (content: ReportContent) => (
    <div className="space-y-4 font-sans text-sm">
      {content.week_summary && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Summary</span>
          <p className="mt-1 text-[var(--text)]">{content.week_summary}</p>
        </div>
      )}
      {content.major_drivers && content.major_drivers.length > 0 && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Major drivers</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[var(--text)]">
            {content.major_drivers.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}
      {content.technical_picture && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Technical</span>
          <p className="mt-1 text-[var(--text)]">{content.technical_picture}</p>
        </div>
      )}
      {content.important_news && content.important_news.length > 0 && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Important news</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[var(--text)]">
            {content.important_news.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {content.upcoming_catalysts && content.upcoming_catalysts.length > 0 && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Upcoming catalysts</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[var(--text)]">
            {content.upcoming_catalysts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {content.key_levels && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Key levels</span>
          <p className="mt-1 font-mono text-[var(--text)]">
            R: ${content.key_levels.resistance ?? '—'} · S: ${content.key_levels.support ?? '—'}
          </p>
        </div>
      )}
      {content.trade_setup_ideas && content.trade_setup_ideas.length > 0 && (
        <div>
          <span className="font-mono text-sm font-medium uppercase text-[var(--gold)]">Setup ideas</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-[var(--text)]">
            {content.trade_setup_ideas.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderDailyContent = (content: ReportContent) => (
    <div className="space-y-2 font-sans text-sm">
      {content.gold_price && (
        <p className="text-[var(--gold2)]">{content.gold_price}</p>
      )}
      {content.bias && (
        <p className="text-[var(--text)]"><strong>Bias:</strong> {content.bias}</p>
      )}
      {content.macro_context && (
        <p className="text-[var(--text)]">{content.macro_context}</p>
      )}
      {content.note && (
        <p className="text-[var(--gold)]">{content.note}</p>
      )}
      {content.events_today && content.events_today.length > 0 && (
        <ul className="list-inside list-disc text-[var(--text2)]">
          {content.events_today.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Panel title="INTELLIGENCE REPORTS">
        <p className="mb-4 font-sans text-xs text-[var(--text2)]">
          Weekly reports run Sundays at 19:00 WAT. Daily briefs run at 06:30 WAT. You can trigger them manually below.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerateDaily}
            disabled={generating !== null}
            className="rounded border border-[var(--gold)] bg-transparent px-3 py-1.5 font-mono text-sm font-medium text-[var(--gold)] hover:bg-[rgba(251,191,36,0.12)] disabled:opacity-50"
          >
            {generating === 'daily' ? 'Generating…' : 'Generate Daily Brief'}
          </button>
          <button
            type="button"
            onClick={handleGenerateWeekly}
            disabled={generating !== null}
            className="rounded border border-[var(--gold)] bg-transparent px-3 py-1.5 font-mono text-sm font-medium text-[var(--gold)] hover:bg-[rgba(251,191,36,0.12)] disabled:opacity-50"
          >
            {generating === 'weekly' ? 'Generating…' : 'Generate Weekly Report'}
          </button>
        </div>

        {isLoading ? (
          <div className="font-sans text-xs text-[var(--text2)]">Loading…</div>
        ) : weeklyReports.length === 0 && dailyReports.length === 0 ? (
          <p className="font-sans text-xs text-[var(--text2)]">
            No reports yet. Generate one above or wait for the scheduled jobs.
          </p>
        ) : (
          <div className="space-y-6">
            {weeklyReports.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded border border-[var(--border)] bg-[var(--bg2)] p-4"
              >
                <div className="mb-3 font-mono text-sm font-medium uppercase tracking-wider text-[var(--gold)]">
                  Week of {r.week_start}
                  {r.delivered_at && (
                    <span className="ml-2 text-[var(--text3)]">
                      · {formatReportDate(r.delivered_at)}
                    </span>
                  )}
                </div>
                {r.content
                  ? renderWeeklyContent(r.content as ReportContent)
                  : <p className="text-[var(--text2)]">No content</p>}
              </div>
            ))}

            {dailyReports.length > 0 && (
              <div>
                <div className="mb-2 font-mono text-sm font-medium uppercase tracking-wider text-[var(--text3)]">
                  Recent daily briefs
                </div>
                <div className="space-y-3">
                  {dailyReports.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="rounded border border-[var(--border2)] bg-[var(--bg2)] p-3"
                    >
                      <div className="mb-2 font-mono text-sm font-medium text-[var(--text3)]">
                        {formatReportDate(r.delivered_at ?? '')}
                      </div>
                      {r.content
                        ? renderDailyContent(r.content as ReportContent)
                        : <p className="text-[var(--text2)]">No content</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
