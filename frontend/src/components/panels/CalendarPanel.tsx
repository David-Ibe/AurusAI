import Panel from './Panel';
import ImpactBadge from '../ui/ImpactBadge';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useCalendar } from '../../hooks/useCalendar';
import { formatWATShort } from '../../lib/formatters';

function ratingToImpact(rating: string): 'HIGH' | 'MED' | 'LOW' {
  const u = (rating || '').toUpperCase();
  if (u.includes('HIGH')) return 'HIGH';
  if (u.includes('LOW')) return 'LOW';
  return 'MED';
}

export default function CalendarPanel() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: eventsData, isLoading, error } = useCalendar(today, today);

  const events = eventsData ?? [];

  if (error) {
    return (
      <Panel title="TODAY'S EVENTS">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel title="TODAY'S EVENTS">
        <div className="space-y-2">
          <SkeletonBlock height="24px" />
          <SkeletonBlock height="24px" />
        </div>
      </Panel>
    );
  }

  if (events.length === 0) {
    return (
      <Panel title="TODAY'S EVENTS">
        <p className="font-sans text-xs text-[var(--text2)]">
          No events today. Sync the calendar to load.
        </p>
      </Panel>
    );
  }

  const hasHighImpact = events.some(
    (e) => (e.impact_rating || '').toUpperCase().includes('HIGH')
  );

  return (
    <Panel title="TODAY'S EVENTS">
      <div className="space-y-2">
        {events.slice(0, 5).map((event) => {
          const impact = ratingToImpact(event.impact_rating || '');
          const timeStr = event.event_time
            ? formatWATShort(event.event_time)
            : '—';
          const note = event.explanation || event.watch_for || '';
          return (
            <div key={event.id ?? event.event_name} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-mono text-[var(--text3)]">{timeStr}</span>
              <ImpactBadge impact={impact} />
              <div className="flex-1 min-w-0">
                <span className="font-sans text-[var(--text)]">{event.event_name}</span>
                {note && (
                  <span className="ml-2 font-sans text-[var(--text2)] truncate block">
                    {note}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasHighImpact && (
        <div
          className="mt-3 rounded p-2 font-sans text-[10px]"
          style={{
            backgroundColor: 'rgba(231,76,60,0.1)',
            borderLeft: '3px solid var(--red)',
            color: 'var(--text2)',
          }}
        >
          HIGH impact event today. Consider reducing position size ahead of release.
        </div>
      )}
    </Panel>
  );
}
