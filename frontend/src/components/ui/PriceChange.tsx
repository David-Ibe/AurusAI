import { formatPrice } from '../../lib/formatters';

type Props = { change: number; pct: number };

export default function PriceChange({ change, pct }: Props) {
  const isUp = change >= 0;
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const arrow = isUp ? '↑' : '↓';
  const sign = change >= 0 ? '+' : '';

  return (
    <span className="font-mono text-sm font-medium" style={{ color }}>
      {arrow} {sign}{formatPrice(change)} ({sign}{pct.toFixed(2)}%)
    </span>
  );
}
