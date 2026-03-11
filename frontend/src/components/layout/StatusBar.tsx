// Placeholder: all services active
const services = [
  { name: 'Price Feed', active: true },
  { name: 'News Monitor', active: true },
  { name: 'Level Watcher', active: true },
  { name: 'Scheduler', active: true },
];

export default function StatusBar() {
  return (
    <footer
      className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--bg1)] px-4"
      style={{ height: 24 }}
    >
      <div className="flex items-center gap-4">
        {services.map(({ name, active }) => (
          <div key={name} className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${active ? 'pulse-dot bg-[var(--green)]' : 'bg-[var(--text3)]'}`}
            />
            <span className="font-mono text-xs font-medium text-[var(--text3)] uppercase">{name}</span>
          </div>
        ))}
      </div>
      <span className="font-mono text-xs font-medium text-[var(--text3)]">
        AurusAI v1.0 · <span className="text-[var(--gold-dim)] font-semibold">by Require Labs</span>
      </span>
    </footer>
  );
}
