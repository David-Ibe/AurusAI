import Panel from './Panel';
import { formatPrice, formatRR } from '../../lib/formatters';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useTrades } from '../../hooks/useTrades';

export default function TradesPanel() {
  const { data: tradesData, isLoading, error } = useTrades(10);

  const trades = tradesData ?? [];

  if (error) {
    return (
      <Panel title="RECENT TRADES">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel title="RECENT TRADES">
        <div className="space-y-2">
          <SkeletonBlock height="24px" />
          <SkeletonBlock height="24px" />
          <SkeletonBlock height="24px" />
        </div>
      </Panel>
    );
  }

  if (trades.length === 0) {
    return (
      <Panel title="RECENT TRADES">
        <p className="font-sans text-sm font-medium text-[var(--text2)]">No trades yet. Log trades in the Journal.</p>
      </Panel>
    );
  }

  const formatDate = (d: string | undefined) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <Panel title="RECENT TRADES">
      <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[480px] font-mono text-sm">
          <thead>
            <tr className="text-[var(--text3)]">
              <th className="px-2 py-1 text-left">DATE</th>
              <th className="px-2 py-1 text-left">DIR</th>
              <th className="px-2 py-1 text-left">ENTRY</th>
              <th className="px-2 py-1 text-left">EXIT</th>
              <th className="px-2 py-1 text-left">RR</th>
              <th className="px-2 py-1 text-left">RESULT</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-t border-[var(--border2)]">
                <td className="px-2 py-1.5 text-[var(--text2)]">
                  {formatDate(t.entry_time)}
                </td>
                <td
                  className="px-2 py-1.5 font-medium"
                  style={{
                    color: t.direction === 'long' ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {t.direction.toUpperCase()}
                </td>
                <td className="px-2 py-1.5 text-[var(--text)]">
                  {formatPrice(Number(t.entry_price))}
                </td>
                <td className="px-2 py-1.5 text-[var(--text)]">
                  {t.exit_price != null ? formatPrice(Number(t.exit_price)) : '—'}
                </td>
                <td className="px-2 py-1.5 text-[var(--text2)]">
                  {t.rr_ratio != null ? formatRR(Number(t.rr_ratio)) : '—'}
                </td>
                <td
                  className="px-2 py-1.5 font-medium"
                  style={{
                    color:
                      t.outcome === 'win'
                        ? 'var(--green)'
                        : t.outcome === 'loss'
                          ? 'var(--red)'
                          : t.outcome === 'breakeven'
                            ? 'var(--amber)'
                            : 'var(--blue)',
                  }}
                >
                  {(t.outcome || 'open').toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
