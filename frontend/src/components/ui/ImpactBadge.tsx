type Impact = 'HIGH' | 'MED' | 'LOW';

const styles: Record<Impact, string> = {
  HIGH: 'bg-[rgba(248,113,113,0.2)] text-[var(--red)] border-[var(--red)]',
  MED: 'bg-[rgba(251,191,36,0.2)] text-[var(--amber)] border-[var(--amber)]',
  LOW: 'bg-[rgba(52,211,153,0.2)] text-[var(--green)] border-[var(--green)]',
};

type Props = { impact: Impact };

export default function ImpactBadge({ impact }: Props) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-medium uppercase ${styles[impact]}`}
    >
      {impact}
    </span>
  );
}
