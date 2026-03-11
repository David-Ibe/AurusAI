import { useState } from 'react';
import Panel from '../components/panels/Panel';
import ImpactBadge from '../components/ui/ImpactBadge';
import SkeletonBlock from '../components/ui/SkeletonBlock';
import { useCalendar } from '../hooks/useCalendar';
import { syncCalendar } from '../lib/api';
import { formatWATShort } from '../lib/formatters';

function ratingToImpact(rating: string): 'HIGH' | 'MED' | 'LOW' {
  const u = (rating || '').toUpperCase();
  if (u.includes('HIGH')) return 'HIGH';
  if (u.includes('LOW')) return 'LOW';
  return 'MED';
}

export default function Calendar() {
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'today' | 'week'>('today');

  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const toDate = weekEnd.toISOString().slice(0, 10);

  const fromDate = filter === 'today' ? today : today;
  const toDateParam = filter === 'today' ? today : toDate;

  const { data: eventsData, isLoading, error, refetch } = useCalendar(fromDate, toDateParam);
  const events = eventsData ?? [];

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncCalendar(fromDate, toDateParam);
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
        <Panel title="ECONOMIC CALENDAR">
          <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
            Feed unavailable.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title="ECONOMIC CALENDAR">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('today')}
              className={`rounded px-2 py-1 font-mono text-sm font-medium uppercase ${
                filter === 'today'
                  ? 'border border-[var(--gold)] bg-[rgba(251,191,36,0.12)] text-[var(--gold)]'
                  : 'border border-[var(--border)] bg-transparent text-[var(--text2)] hover:border-[var(--gold-dim)]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`rounded px-2 py-1 font-mono text-sm font-medium uppercase ${
                filter === 'week'
                  ? 'border border-[var(--gold)] bg-[rgba(251,191,36,0.12)] text-[var(--gold)]'
                  : 'border border-[var(--border)] bg-transparent text-[var(--text2)] hover:border-[var(--gold-dim)]'
              }`}
            >
              This Week
            </button>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded border border-[var(--gold)] bg-transparent px-3 py-1.5 font-mono text-sm font-medium text-[var(--gold)] hover:bg-[rgba(251,191,36,0.12)] disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <SkeletonBlock height="32px" />
            <SkeletonBlock height="32px" />
            <SkeletonBlock height="32px" />
          </div>
        ) : events.length === 0 ? (
          <p className="font-sans text-xs text-[var(--text2)]">
            No events. Click <strong>Sync</strong> to fetch.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const impact = ratingToImpact(event.impact_rating || '');
              const timeStr = event.event_time ? formatWATShort(event.event_time) : '—';
              const note = event.explanation || event.watch_for || '';
              return (
                <div
                  key={event.id ?? event.event_name}
                  className="flex items-center gap-3 rounded border border-[var(--border)] p-3 text-xs"
                >
                  <span className="w-14 shrink-0 font-mono text-[var(--text2)]">{timeStr}</span>
                  <ImpactBadge impact={impact} />
                  <div className="min-w-0 flex-1">
                    <span className="font-sans text-[var(--text)]">{event.event_name}</span>
                    {note && (
                      <p className="mt-1 font-sans text-sm font-medium text-[var(--text2)]">{note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
