import { useState } from 'react';
import Panel from '../components/panels/Panel';
import { useTrades } from '../hooks/useTrades';
import {
  createTrade,
  updateTrade,
  type Trade,
  type TradeCreateInput,
} from '../lib/api';
import { formatPrice, formatRR } from '../lib/formatters';

function formatDate(d: string | undefined) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export default function Journal() {
  const { data: tradesData, isLoading, error, refetch } = useTrades(100);
  const trades = (tradesData ?? []).sort((a, b) => {
    const ta = a.entry_time ? new Date(a.entry_time).getTime() : 0;
    const tb = b.entry_time ? new Date(b.entry_time).getTime() : 0;
    return tb - ta;
  });

  const [showForm, setShowForm] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [lotSize, setLotSize] = useState('');
  const [rrRatio, setRrRatio] = useState('');
  const [setup, setSetup] = useState('');
  const [session, setSession] = useState<string>('');
  const [newsDay, setNewsDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [closing, setClosing] = useState<string | null>(null);
  const [exitPrice, setExitPrice] = useState('');
  const [outcome, setOutcome] = useState<'win' | 'loss' | 'breakeven'>('win');
  const [pnl, setPnl] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(entryPrice);
    if (isNaN(p)) return;
    setSubmitting(true);
    try {
      const input: TradeCreateInput = {
        entry_price: p,
        direction,
        news_day: newsDay,
      };
      if (lotSize) input.lot_size = parseFloat(lotSize);
      if (rrRatio) input.rr_ratio = parseFloat(rrRatio);
      if (setup.trim()) input.setup_description = setup.trim();
      if (session) input.session = session as TradeCreateInput['session'];
      if (notes.trim()) input.notes = notes.trim();
      await createTrade(input);
      setEntryPrice('');
      setLotSize('');
      setRrRatio('');
      setSetup('');
      setSession('');
      setNewsDay(false);
      setNotes('');
      setShowForm(false);
      refetch();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (t: Trade) => {
    const ex = parseFloat(exitPrice);
    if (isNaN(ex)) return;
    setSubmitting(true);
    try {
      await updateTrade(t.id, {
        exit_price: ex,
        outcome,
        pnl_dollars: pnl ? parseFloat(pnl) : undefined,
      });
      setClosing(null);
      setExitPrice('');
      setOutcome('win');
      setPnl('');
      refetch();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const startClose = (t: Trade) => {
    setClosing(t.id);
    setExitPrice(String(t.exit_price ?? t.entry_price));
    setOutcome('win');
    setPnl('');
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Panel title="TRADE JOURNAL">
          <div className="rounded border border-[var(--red)] p-2 font-mono text-sm font-medium text-[var(--red)]">
            Failed to load trades.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel
        title="TRADE JOURNAL"
        badge={trades.length > 0 ? `${trades.length} trades` : undefined}
      >
        <p className="mb-4 font-sans text-xs text-[var(--text2)]">
          Log trades as you take them. Close positions to record outcomes and feed insights.
        </p>

        <div className="mb-4">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded border border-[var(--gold)] bg-[rgba(251,191,36,0.1)] px-3 py-1.5 font-mono text-sm font-medium text-[var(--gold)] hover:bg-[rgba(251,191,36,0.15)]"
            >
              + Log Trade
            </button>
          ) : (
            <form
              onSubmit={handleAdd}
              className="space-y-3 rounded border border-[var(--border)] bg-[var(--bg2)] p-3"
            >
              <div className="flex flex-wrap gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Entry price *"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required
                  className="w-28 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as 'long' | 'short')}
                  className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)]"
                >
                  <option value="long">Long</option>
                  <option value="short">Short</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Lot size"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="RR ratio"
                  value={rrRatio}
                  onChange={(e) => setRrRatio(e.target.value)}
                  className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)]"
                >
                  <option value="">Session</option>
                  <option value="london">London</option>
                  <option value="new_york">New York</option>
                  <option value="asian">Asian</option>
                  <option value="overlap">Overlap</option>
                </select>
                <label className="flex items-center gap-2 font-sans text-xs text-[var(--text2)]">
                  <input
                    type="checkbox"
                    checked={newsDay}
                    onChange={(e) => setNewsDay(e.target.checked)}
                    className="rounded"
                  />
                  News day
                </label>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Setup (optional)"
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-sans text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
              </div>
              <div>
                <textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full max-w-md rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-sans text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-[var(--gold)] px-3 py-1.5 font-mono text-sm font-medium text-[var(--bg)] hover:bg-[var(--gold2)] disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-[var(--border)] px-3 py-1.5 font-mono text-sm font-medium text-[var(--text2)] hover:border-[var(--border2)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {isLoading ? (
          <div className="font-sans text-xs text-[var(--text2)]">Loading…</div>
        ) : trades.length === 0 ? (
          <p className="font-sans text-xs text-[var(--text2)]">
            No trades yet. Log your first trade to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-[var(--text3)]">
                  <th className="px-2 py-1 text-left">DATE</th>
                  <th className="px-2 py-1 text-left">DIR</th>
                  <th className="px-2 py-1 text-left">ENTRY</th>
                  <th className="px-2 py-1 text-left">EXIT</th>
                  <th className="px-2 py-1 text-left">RR</th>
                  <th className="px-2 py-1 text-left">RESULT</th>
                  <th className="px-2 py-1 text-left">SETUP</th>
                  <th className="px-2 py-1 text-right">ACTIONS</th>
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
                    <td className="max-w-[120px] truncate px-2 py-1.5 font-sans text-[var(--text2)]">
                      {t.setup_description || '—'}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {t.outcome === 'open' || !t.outcome ? (
                        closing === t.id ? (
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Exit"
                              value={exitPrice}
                              onChange={(e) => setExitPrice(e.target.value)}
                              className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5 font-mono text-sm font-medium"
                            />
                            <select
                              value={outcome}
                              onChange={(e) => setOutcome(e.target.value as 'win' | 'loss' | 'breakeven')}
                              className="rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5 font-mono text-sm font-medium"
                            >
                              <option value="win">Win</option>
                              <option value="loss">Loss</option>
                              <option value="breakeven">BE</option>
                            </select>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="PnL $"
                              value={pnl}
                              onChange={(e) => setPnl(e.target.value)}
                              className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5 font-mono text-sm font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => handleClose(t)}
                              disabled={submitting}
                              className="rounded bg-[var(--green)] px-2 py-0.5 font-mono text-sm font-medium text-[var(--bg)] disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setClosing(null)}
                              className="rounded border border-[var(--border)] px-2 py-0.5 font-mono text-sm font-medium text-[var(--text2)]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startClose(t)}
                            disabled={submitting}
                            className="rounded border border-[var(--green)] px-2 py-0.5 font-mono text-sm font-medium text-[var(--green)] hover:bg-[rgba(52,211,153,0.15)]"
                          >
                            Close
                          </button>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
