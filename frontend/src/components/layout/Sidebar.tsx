import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: '⬡', path: '/dashboard', label: 'DASH' },
  { icon: '◈', path: '/calendar', label: 'CAL' },
  { icon: '◉', path: '/news', label: 'NEWS' },
  { icon: '⊞', path: '/levels', label: 'LEVELS' },
  { icon: '◎', path: '/journal', label: 'JOURNAL' },
  { icon: '◆', path: '/insights', label: 'INSIGHTS' },
  { icon: '▣', path: '/report', label: 'REPORT' },
];

export default function Sidebar() {
  return (
    <aside
      className="flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg1)]"
      style={{ width: 88, height: 'calc(100vh - 44px - 24px)' }}
    >
      <nav className="mt-4 flex flex-1 flex-col gap-2 px-2">
        {navItems.map(({ icon, path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-md py-2 transition-colors ${
                isActive
                  ? 'border border-[rgba(212,148,58,0.25)] bg-[rgba(212,148,58,0.12)] text-[var(--gold)]'
                  : 'text-[var(--text2)] hover:bg-[rgba(212,148,58,0.08)] hover:text-[var(--gold)]'
              }`
            }
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
            <span
              className="font-mono text-[7px] font-medium uppercase tracking-wider"
              style={{ letterSpacing: 0.5 }}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
