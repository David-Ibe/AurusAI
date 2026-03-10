type Impact = 'HIGH' | 'MED' | 'LOW';

const styles: Record<Impact, string> = {
  HIGH: 'bg-[rgba(231,76,60,0.2)] text-[var(--red)] border-[var(--red)]',
  MED: 'bg-[rgba(243,156,18,0.2)] text-[var(--amber)] border-[var(--amber)]',
  LOW: 'bg-[rgba(46,204,113,0.2)] text-[var(--green)] border-[var(--green)]',
};

type Props = { impact: Impact };

export default function ImpactBadge({ impact }: Props) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 font-mono text-[9px] uppercase ${styles[impact]}`}
    >
      {impact}
    </span>
  );
}
