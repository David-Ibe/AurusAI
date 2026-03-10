// bias from -1 (bearish) to 1 (bullish), 0 = neutral
type Props = { bias: number };

export default function BiasBar({ bias }: Props) {
  // bias -1 to 1 maps to left 0% to right 100%
  const pos = ((bias + 1) / 2) * 100;

  return (
    <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg3)]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(to right, var(--red), var(--amber), var(--green))',
          opacity: 0.4,
        }}
      />
      <div
        className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-[var(--gold)] bg-[var(--bg)]"
        style={{ left: `calc(${pos}% - 4px)` }}
      />
    </div>
  );
}
