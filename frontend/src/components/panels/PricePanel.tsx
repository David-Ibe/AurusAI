import Panel from './Panel';
import { formatPrice } from '../../lib/formatters';
import PriceChange from '../ui/PriceChange';
import Sparkline from '../ui/Sparkline';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useGoldPrice } from '../../hooks/useGoldPrice';

export default function PricePanel() {
  const { data, isLoading, error } = useGoldPrice();
  const price = data?.price ?? null;
  const hasPrice = price != null && price > 0;

  if (error) {
    return (
      <Panel title="XAU/USD">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (!hasPrice && data?.error) {
    return (
      <Panel title="XAU/USD">
        <div className="rounded border border-[var(--amber)] p-2 font-mono text-[10px] text-[var(--amber)]">
          {data.error}
        </div>
      </Panel>
    );
  }

  if (isLoading && !hasPrice) {
    return (
      <Panel title="XAU/USD">
        <SkeletonBlock height="32px" width="120px" />
        <SkeletonBlock height="14px" className="mt-2" />
      </Panel>
    );
  }

  if (!hasPrice) {
    return (
      <Panel title="XAU/USD">
        <div className="rounded border border-[var(--amber)] p-2 font-mono text-[10px] text-[var(--amber)]">
          Price feed unavailable. Add TWELVEDATA_API_KEY or FMP_API_KEY to .env
        </div>
      </Panel>
    );
  }

  // Backend only returns current price — no 24h change or session H/L yet
  const change = 0;
  const pct = 0;
  const sessionH = price + 10;
  const sessionL = price - 16;
  const bid = price - 0.1;
  const ask = price + 0.1;
  const sparklineData = [sessionL, sessionL + 4, price - 5, price - 2, price];

  return (
    <Panel title="XAU/USD">
      <div
        className="mb-3 h-0.5 w-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold), var(--gold2), var(--gold), transparent)',
        }}
      />
      <div className="font-mono text-[32px] font-medium" style={{ color: 'var(--gold2)' }}>
        ${formatPrice(price)}
      </div>
      {change !== 0 ? (
        <div className="mt-1">
          <PriceChange change={change} pct={pct} />
        </div>
      ) : (
        <div className="mt-1 font-mono text-xs text-[var(--text3)]">— 24h</div>
      )}
      <div className="mt-3">
        <Sparkline data={sparklineData} positive={true} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: 'Session H', value: sessionH },
          { label: 'Session L', value: sessionL },
          { label: 'Bid', value: bid },
          { label: 'Ask', value: ask },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded p-2 font-mono text-xs"
            style={{ backgroundColor: 'var(--bg2)' }}
          >
            <div className="text-[var(--text2)]">{label}</div>
            <div className="text-[var(--gold2)]">${formatPrice(value)}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
