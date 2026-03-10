import { useState, useEffect } from 'react';
import { formatWAT } from '../../lib/formatters';
import { useCalendar } from '../../hooks/useCalendar';

const SESSION = 'London Open';
const BIAS = 'Neutral → Bullish';

export default function Topbar() {
  const [time, setTime] = useState(new Date());
  const today = new Date().toISOString().slice(0, 10);
  const { data: eventsData } = useCalendar(today, today);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const events = eventsData ?? [];
  const nextHighImpact = events.find((e) =>
    (e.impact_rating || '').toUpperCase().includes('HIGH')
  );
  const nextEvent = nextHighImpact ?? events[0];
  const nextEventTime = nextEvent?.event_time
    ? formatWAT(new Date(nextEvent.event_time)).slice(0, 5)
    : '—';
  const nextEventName = nextEvent?.event_name ?? '—';

  const isLondon = SESSION.includes('London');
  const isNY = SESSION.includes('New York');

  return (
    <header
      className="flex h-11 items-center justify-between border-b border-[var(--border)] bg-[var(--bg1)] px-4"
      style={{ height: 44 }}
    >
      <div className="flex items-center gap-3 border-r border-[var(--border)] pr-4">
        <span
          className="font-mono leading-none"
          style={{ fontSize: 18, color: 'var(--gold)', textShadow: '0 0 12px rgba(212,148,58,0.4)' }}
        >
          ⬡
        </span>
        <span
          className="font-mono font-bold"
          style={{ fontSize: 12, color: 'var(--gold2)', letterSpacing: 2 }}
        >
          AURUSAI
        </span>
      </div>

      <div className="flex items-center gap-2 border-r border-[var(--border)] px-4">
        <span
          className="flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[10px] uppercase"
          style={{
            background: isLondon ? 'rgba(212,148,58,0.15)' : isNY ? 'rgba(46,204,113,0.1)' : 'var(--bg3)',
            color: isLondon ? 'var(--gold)' : isNY ? 'var(--green)' : 'var(--text3)',
            border: isLondon ? '1px solid rgba(212,148,58,0.3)' : '1px solid transparent',
          }}
        >
          <span className="text-[9px]">⬡</span>
          {SESSION}
        </span>
      </div>

      <div className="flex items-center gap-2 border-r border-[var(--border)] px-4">
        <span className="font-mono text-[10px] text-[var(--text3)]">NEXT</span>
        <span className="font-mono text-xs text-[var(--text)] truncate max-w-[120px]">
          {nextEventName}
        </span>
        <span className="font-mono text-xs text-[var(--gold)] shrink-0">
          {nextEventTime} WAT
        </span>
      </div>

      <div className="flex items-center gap-2 border-r border-[var(--border)] px-4">
        <span className="font-mono text-[10px] text-[var(--text3)]">BIAS</span>
        <span className="font-mono text-xs text-[var(--text2)]">{BIAS}</span>
      </div>

      <div className="pl-4">
        <span className="font-mono text-xs text-[var(--text2)]">
          {formatWAT(time)} WAT
        </span>
      </div>
    </header>
  );
}
