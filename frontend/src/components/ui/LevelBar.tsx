// Proximity bar: resistance = red fill from right, support = green fill from left
type Props = {
  type: 'resistance' | 'support';
  distance: number; // dollars from current price
  maxDistance?: number;
  isClose?: boolean;
};

export default function LevelBar({ type, distance, maxDistance = 50, isClose }: Props) {
  const pct = Math.min(100, (Math.abs(distance) / maxDistance) * 100);
  const color = type === 'resistance' ? 'var(--red)' : 'var(--green)';
  const fillColor = isClose ? 'var(--amber)' : color;

  return (
    <div className="flex w-24 items-center gap-2">
      <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--bg3)]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
            marginLeft: type === 'support' ? 0 : 'auto',
          }}
        />
      </div>
    </div>
  );
}
