type Impact = 'HIGH' | 'MED' | 'LOW';

const styles: Record<Impact, { bg: string; glow?: boolean }> = {
  HIGH: { bg: 'var(--red)', glow: true },
  MED: { bg: 'var(--amber)' },
  LOW: { bg: 'var(--green)' },
};

type Props = { impact: Impact };

export default function ImpactDot({ impact }: Props) {
  const { bg, glow } = styles[impact];
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${glow ? 'impact-dot-high' : ''}`}
      style={{ backgroundColor: bg }}
    />
  );
}
