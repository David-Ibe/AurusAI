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

const navLinkClass = (isActive: boolean) =>
  `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-md py-2 px-1 transition-colors touch-manipulation ${
    isActive
      ? 'border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.12)] text-[var(--gold)]'
      : 'text-[var(--text2)] hover:bg-[rgba(251,191,36,0.08)] hover:text-[var(--gold)] active:bg-[rgba(251,191,36,0.06)]'
  }`;

export default function Sidebar() {
  return (
    <>
      {/* Desktop: left sidebar */}
      <aside
        className="hidden shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg1)] md:flex"
        style={{ width: 88, height: 'calc(100vh - 44px - 24px)' }}
      >
        <nav className="mt-4 flex flex-1 flex-col gap-2 px-2">
          {navItems.map(({ icon, path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider" style={{ letterSpacing: 0.5 }}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile: bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[var(--border)] bg-[var(--bg1)] px-1 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {navItems.map(({ icon, path, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            className={({ isActive }) => navLinkClass(isActive)}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
            <span className="font-mono text-[10px] font-semibold uppercase leading-tight">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
