import Panel from './Panel';
import { formatPrice } from '../../lib/formatters';
import LevelBar from '../ui/LevelBar';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useGoldPrice } from '../../hooks/useGoldPrice';
import { useLevels } from '../../hooks/useLevels';

export default function KeyLevels() {
  const { data: priceData } = useGoldPrice();
  const { data: levelsData, isLoading, error } = useLevels();

  const currentPrice = priceData?.price ?? 0;
  const levels = levelsData ?? [];

  const enriched = levels
    .map((l) => {
      const dist = currentPrice ? Number(l.price) - currentPrice : 0;
      const absDist = Math.abs(dist);
      const label = (l.label || '').toLowerCase();
      const isPreCpi = label.includes('pre-cpi') || label.includes('pre cpi');
      const isClose = isPreCpi ? absDist < 15 : absDist < 5;
      return { ...l, distance: dist, isClose };
    })
    .sort((a, b) => Math.abs(a.distance) - Math.abs(b.distance));

  if (error) {
    return (
      <Panel title="KEY LEVELS">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel title="KEY LEVELS">
        <div className="space-y-3">
          <SkeletonBlock height="20px" />
          <SkeletonBlock height="20px" />
          <SkeletonBlock height="20px" />
        </div>
      </Panel>
    );
  }

  if (enriched.length === 0) {
    return (
      <Panel title="KEY LEVELS">
        <p className="font-sans text-sm font-medium text-[var(--text2)]">No levels. Add levels in the Levels page.</p>
      </Panel>
    );
  }

  return (
    <Panel title="KEY LEVELS">
      <div className="max-h-48 space-y-3 overflow-y-auto">
        {enriched.map((level) => (
          <div key={level.id} className="flex items-center gap-3 text-base">
            <span
              className="w-4 font-mono font-semibold"
              style={{
                color: level.type === 'resistance' ? 'var(--red)' : 'var(--green)',
              }}
            >
              [{level.type === 'resistance' ? 'R' : 'S'}]
            </span>
            <span className="w-24 font-mono text-base font-semibold text-[var(--text)]">
              {formatPrice(Number(level.price))}
            </span>
            <span className="flex-1 font-sans text-[var(--text2)]">
              {level.label || '—'}
            </span>
            <span
              className={`w-20 font-mono font-semibold ${level.isClose ? 'text-[var(--amber)]' : 'text-[var(--text2)]'}`}
            >
              {level.distance >= 0 ? '+' : ''}${formatPrice(level.distance)}
              {level.isClose && ' ⚠'}
            </span>
            <LevelBar
              type={level.type}
              distance={level.distance}
              isClose={level.isClose}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
}
