import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  badge?: string;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, badge, children, className = '' }: PanelProps) {
  return (
    <div className={`panel fade-in ${className}`}>
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        {badge != null && (
          <span className="font-mono text-xs font-medium text-[var(--text3)]">{badge}</span>
        )}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
}
