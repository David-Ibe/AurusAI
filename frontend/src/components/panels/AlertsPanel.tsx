import Panel from './Panel';
import SkeletonBlock from '../ui/SkeletonBlock';
import { useAlerts } from '../../hooks/useAlerts';
import { formatWATShort } from '../../lib/formatters';

export default function AlertsPanel() {
  const { data: alertsData, isLoading, error } = useAlerts(10);

  const alerts = alertsData ?? [];

  if (error) {
    return (
      <Panel title="RECENT ALERTS">
        <div className="rounded border border-[var(--red)] p-2 font-mono text-[10px] text-[var(--red)]">
          Feed unavailable
        </div>
      </Panel>
    );
  }

  if (isLoading) {
    return (
      <Panel title="RECENT ALERTS">
        <div className="space-y-2">
          <SkeletonBlock height="36px" />
          <SkeletonBlock height="36px" />
        </div>
      </Panel>
    );
  }

  if (alerts.length === 0) {
    return (
      <Panel title="RECENT ALERTS">
        <p className="font-sans text-xs text-[var(--text2)]">No alerts yet.</p>
      </Panel>
    );
  }

  return (
    <Panel title="RECENT ALERTS">
      <div className="max-h-40 space-y-3 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="rounded px-2 py-0.5 font-mono text-[9px]"
                style={{
                  backgroundColor: 'rgba(212,148,58,0.15)',
                  color: 'var(--gold)',
                }}
              >
                [{alert.type.toUpperCase()}]
              </span>
              <span className="font-sans text-[11px] text-[var(--text)]">
                {alert.message}
              </span>
            </div>
            <div className="font-mono text-[9px] text-[var(--text3)]">
              {formatWATShort(alert.fired_at)} · {alert.channel || 'both'}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
