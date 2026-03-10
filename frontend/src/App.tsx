import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import News from './pages/News';
import Levels from './pages/Levels';
import Journal from './pages/Journal';
import Insights from './pages/Insights';
import Report from './pages/Report';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="news" element={<News />} />
            <Route path="levels" element={<Levels />} />
            <Route path="journal" element={<Journal />} />
            <Route path="insights" element={<Insights />} />
            <Route path="report" element={<Report />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
