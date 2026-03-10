import { useCalendar } from '../../hooks/useCalendar';
import { useReports } from '../../hooks/useReports';

export default function ThreeQuestions() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: eventsData } = useCalendar(today, today);
  const { data: reportsData } = useReports(5);

  const events = eventsData ?? [];
  const highImpactEvent = events.find((e) =>
    (e.impact_rating || '').toUpperCase().includes('HIGH')
  );
  const hasHighImpactToday = !!highImpactEvent;
  const eventName = highImpactEvent?.event_name ?? 'High impact';

  const report = reportsData?.find((r) => r.content) ?? reportsData?.[0];
  const content = (report?.content ?? {}) as Record<string, unknown>;
  const bias = ((content.bias as string) || 'Neutral').toLowerCase();

  const isBullish = bias.includes('bullish');
  const isBearish = bias.includes('bearish');
  const isCautious = bias.includes('cautious') || bias.includes('wait') || bias.includes('avoid');
  const hasBias = isBullish || isBearish;

  let tradeBadge: { text: string; cls: string };
  let waitBadge: { text: string; cls: string };
  let stayOutBadge: { text: string; cls: string };

  if (hasHighImpactToday) {
    tradeBadge = { text: 'WAIT', cls: 'answer-badge--wait' };
    waitBadge = { text: eventName.length > 12 ? eventName.slice(0, 12) + '…' : eventName, cls: 'answer-badge--wait' };
    stayOutBadge = { text: 'REDUCE SIZE', cls: 'answer-badge--wait' };
  } else {
    tradeBadge = hasBias
      ? { text: 'TRADE', cls: 'answer-badge--trade' }
      : isCautious
        ? { text: 'CAUTION', cls: 'answer-badge--wait' }
        : { text: 'CHECK BIAS', cls: 'answer-badge--wait' };
    waitBadge = { text: 'NO', cls: 'answer-badge--stay-out' };
    stayOutBadge = { text: 'NO', cls: 'answer-badge--stay-out' };
  }

  return (
    <div className="grid gap-2 md:grid-cols-3">
      <div className="question-frame">
        <span className="font-sans text-[11px] text-[var(--text2)]">Should I trade?</span>
        <span className={`answer-badge ${tradeBadge.cls}`}>{tradeBadge.text}</span>
      </div>
      <div className="question-frame">
        <span className="font-sans text-[11px] text-[var(--text2)]">Should I wait?</span>
        <span className={`answer-badge ${waitBadge.cls}`}>{waitBadge.text}</span>
      </div>
      <div className="question-frame">
        <span className="font-sans text-[11px] text-[var(--text2)]">Should I stay out?</span>
        <span className={`answer-badge ${stayOutBadge.cls}`}>{stayOutBadge.text}</span>
      </div>
    </div>
  );
}
