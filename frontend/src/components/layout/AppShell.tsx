import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import StatusBar from './StatusBar';

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main
          className="flex-1 overflow-auto p-4 pb-24 md:p-5 md:pb-5"
          style={{ minHeight: 'calc(100vh - 44px - 24px)' }}
        >
          <Outlet />
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
