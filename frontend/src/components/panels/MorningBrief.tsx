import Panel from './Panel';
import { formatPrice } from '../../lib/formatters';
import BiasBar from '../ui/BiasBar';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import { useMacro } from '../../hooks/useMacro';
import { useReports } from '../../hooks/useReports';

function parseBiasToValue(bias: string): number {
  const lower = (bias || '').toLowerCase();
  if (lower.includes('bearish')) return -0.6;
  if (lower.includes('bullish')) return 0.5;
  return 0;
}

export default function MorningBrief() {
  const { data: priceData, isLoading: priceLoading, error: priceError } = useGoldPrice();
  const { data: macroData, isLoading: macroLoading } = useMacro();
  const { data: reportsData } = useReports(5);

  const isLoading = priceLoading || macroLoading;
  const price = priceData?.price ?? 0;
  const report = reportsData?.find((r) => !r.week_start && r.content) ?? reportsData?.[0];
  const content = (report?.content ?? {}) as Record<string, unknown>;
  const goldPriceStr = (content.gold_price as string) || (price ? `$${formatPrice(price)}` : '—');
  const bias = (content.bias as string) || 'Neutral';
  const biasValue = parseBiasToValue(bias);
  const macroContext = (content.macro_context as string) || '';
  const note = (content.note as string) || '';

  const treasury = macroData?.treasury_rates ?? {};
  const treasuryRate = typeof treasury === 'object' && treasury !== null
    ? (treasury as Record<string, unknown>).rate
      ?? (treasury as Record<string, unknown>).yield_10_year
      ?? (treasury as Record<string, unknown>).yield
    : null;
  const yieldsStr = treasuryRate != null ? `${treasuryRate}%` : '—';

  if (priceError) {
    return (
      <Panel title="MORNING BRIEF">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading && !price) {
    return (
      <Panel title="MORNING BRIEF">
        <div className="space-y-2">
          <SkeletonBlock height="14px" />
          <SkeletonBlock height="14px" />
          <SkeletonBlock height="14px" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="MORNING BRIEF">
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-[var(--text2)]">GOLD</span>
          <span
            className="text-[var(--gold2)]"
            style={{ lineHeight: 1.6, wordSpacing: '0.05em', flex: 1, minWidth: 0 }}
          >
            {goldPriceStr}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-[var(--text2)]">BIAS</span>
          <span className="text-[var(--text)]" style={{ lineHeight: 1.6, flex: 1, minWidth: 0 }}>
            {bias}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="shrink-0 text-[var(--text2)]">YIELDS</span>
          <span className="text-[var(--text)]" style={{ lineHeight: 1.6, flex: 1, minWidth: 0 }}>
            {yieldsStr}
          </span>
        </div>
      </div>
      <BiasBar bias={biasValue} />
      <div
        className="border-l-2 font-sans text-[11px]"
        style={{
          borderColor: 'var(--gold-dim)',
          backgroundColor: 'var(--bg2)',
          color: 'var(--text)',
          lineHeight: 1.7,
          wordSpacing: '0.04em',
          marginLeft: -12,
          marginRight: -12,
          paddingLeft: 10,
          paddingRight: 12,
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {macroContext || note || 'Morning intelligence will appear once the daily brief has run.'}
      </div>
    </Panel>
  );
}
