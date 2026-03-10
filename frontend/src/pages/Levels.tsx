import { useState } from 'react';
import Panel from '../components/panels/Panel';
import { useLevels } from '../hooks/useLevels';
import {
  createLevel,
  deleteLevel,
  updateLevel,
  type Level,
  type LevelCreateInput,
} from '../lib/api';
import { formatPrice } from '../lib/formatters';

export default function Levels() {
  const { data: levelsData, isLoading, error, refetch } = useLevels(true);
  const levels = (levelsData ?? []).sort(
    (a, b) => Number(b.price) - Number(a.price)
  );

  const [showForm, setShowForm] = useState(false);
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'support' | 'resistance'>('resistance');
  const [label, setLabel] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editType, setEditType] = useState<'support' | 'resistance'>('resistance');
  const [editLabel, setEditLabel] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    if (isNaN(p)) return;
    setSubmitting(true);
    try {
      const input: LevelCreateInput = {
        price: p,
        type,
        alert_threshold: parseFloat(alertThreshold) || 2,
      };
      if (label.trim()) input.label = label.trim();
      await createLevel(input);
      setPrice('');
      setLabel('');
      setAlertThreshold('2');
      setShowForm(false);
      refetch();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (l: Level) => {
    setEditing(l.id);
    setEditPrice(String(l.price));
    setEditType(l.type as 'support' | 'resistance');
    setEditLabel(l.label ?? '');
    setEditThreshold(String(l.alert_threshold ?? 2));
  };

  const cancelEdit = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const p = parseFloat(editPrice);
    if (isNaN(p)) return;
    setSubmitting(true);
    try {
      await updateLevel(editing, {
        price: p,
        type: editType,
        label: editLabel.trim() || undefined,
        alert_threshold: parseFloat(editThreshold) || 2,
      });
      setEditing(null);
      refetch();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this level?')) return;
    setSubmitting(true);
    try {
      await deleteLevel(id);
      refetch();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <Panel title="LEVEL MANAGER">
          <div className="rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
            Failed to load levels.
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Panel title="LEVEL MANAGER" badge={levels.length > 0 ? `${levels.length} levels` : undefined}>
        <p className="mb-4 font-sans text-xs text-[var(--text2)]">
          Add support and resistance levels. The price watcher alerts when gold approaches within the threshold.
        </p>

        <div className="mb-4">
          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded border border-[var(--gold)] bg-[rgba(212,148,58,0.08)] px-3 py-1.5 font-mono text-[11px] text-[var(--gold)] hover:bg-[rgba(212,148,58,0.15)]"
            >
              + Add Level
            </button>
          ) : (
            <form onSubmit={handleAdd} className="rounded border border-[var(--border)] bg-[var(--bg2)] p-3">
              <div className="mb-3 flex flex-wrap gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-28 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'support' | 'resistance')}
                  className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)]"
                >
                  <option value="support">Support</option>
                  <option value="resistance">Resistance</option>
                </select>
                <input
                  type="text"
                  placeholder="Label (optional)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-32 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-sans text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="Alert ±$"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text3)]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-[var(--gold)] px-3 py-1.5 font-mono text-[11px] text-[var(--bg)] hover:bg-[var(--gold2)] disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded border border-[var(--border)] px-3 py-1.5 font-mono text-[11px] text-[var(--text2)] hover:border-[var(--border2)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {isLoading ? (
          <div className="font-sans text-xs text-[var(--text2)]">Loading…</div>
        ) : levels.length === 0 ? (
          <p className="font-sans text-xs text-[var(--text2)]">
            No levels yet. Add support and resistance to monitor.
          </p>
        ) : (
          <div className="space-y-2">
            {levels.map((l) => (
              <div
                key={l.id}
                className={`flex flex-wrap items-center gap-3 rounded border p-2 text-xs ${
                  l.type === 'resistance'
                    ? 'border-[rgba(231,76,60,0.3)] bg-[rgba(231,76,60,0.06)]'
                    : 'border-[rgba(46,204,113,0.3)] bg-[rgba(46,204,113,0.06)]'
                }`}
              >
                {editing === l.id ? (
                  <>
                    <input
                      type="number"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-24 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[var(--text)]"
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as 'support' | 'resistance')}
                      className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[var(--text)]"
                    >
                      <option value="support">Support</option>
                      <option value="resistance">Resistance</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Label"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-24 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-sans text-[var(--text)]"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(e.target.value)}
                      className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1 font-mono text-[var(--text)]"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={submitting}
                        className="rounded bg-[var(--gold)] px-2 py-1 font-mono text-[10px] text-[var(--bg)] hover:bg-[var(--gold2)] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded border border-[var(--border)] px-2 py-1 font-mono text-[10px] text-[var(--text2)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className="font-mono font-medium"
                      style={{
                        color: l.type === 'resistance' ? 'var(--red)' : 'var(--green)',
                      }}
                    >
                      [{l.type === 'resistance' ? 'R' : 'S'}]
                    </span>
                    <span className="font-mono text-[var(--gold2)]">
                      ${formatPrice(Number(l.price))}
                    </span>
                    {l.label && (
                      <span className="font-sans text-[var(--text2)]">{l.label}</span>
                    )}
                    <span className="font-mono text-[var(--text3)]">
                      ±${Number(l.alert_threshold ?? 2).toFixed(1)}
                    </span>
                    <div className="ml-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(l)}
                          disabled={submitting}
                          className="rounded border border-[var(--border)] px-2 py-1 font-mono text-[10px] text-[var(--text2)] hover:border-[var(--gold-dim)] hover:text-[var(--gold)] disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id)}
                          disabled={submitting}
                          className="rounded border border-[var(--border)] px-2 py-1 font-mono text-[10px] text-[var(--text2)] hover:border-[var(--red)] hover:text-[var(--red)] disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
