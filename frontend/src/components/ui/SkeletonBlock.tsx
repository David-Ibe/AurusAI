type Props = { className?: string; width?: string; height?: string };

export default function SkeletonBlock({ className = '', width, height }: Props) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--border2)] ${className}`}
      style={{ width: width ?? '100%', height: height ?? 16 }}
    />
  );
}
