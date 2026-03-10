import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { 'Content-Type': 'application/json' },
});

// Price
export type PriceResponse = { price: number | null; symbol: string; error?: string };

export async function fetchPrice(): Promise<PriceResponse> {
  const { data } = await api.get<PriceResponse>('/api/price');
  return data;
}

// Macro
export type MacroResponse = {
  treasury_rates: Record<string, unknown>;
  indicators: {
    gdp: Record<string, unknown>;
    cpi: Record<string, unknown>;
    unemployment: Record<string, unknown>;
  };
};

export async function fetchMacro(): Promise<MacroResponse> {
  const { data } = await api.get<MacroResponse>('/api/macro');
  return data;
}

// Calendar
export type CalendarEvent = {
  id?: string;
  event_name: string;
  event_time: string;
  impact_rating: string;
  explanation?: string;
  historical_pattern?: string;
  watch_for?: string;
};

export async function fetchCalendarEvents(
  fromDate?: string,
  toDate?: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  const { data } = await api.get<{ events: CalendarEvent[] }>(
    `/api/calendar/events?${params.toString()}`
  );
  return data.events || [];
}

export async function syncCalendar(
  fromDate?: string,
  toDate?: string,
  useAi = false
): Promise<{ synced: number }> {
  const params = new URLSearchParams();
  if (fromDate) params.set('from_date', fromDate);
  if (toDate) params.set('to_date', toDate);
  if (useAi) params.set('use_ai', 'true');
  const { data } = await api.post<{ synced: number }>(`/api/calendar/sync?${params.toString()}`);
  return data;
}

// News
export type NewsItem = {
  id?: string;
  headline: string;
  source: string;
  url?: string;
  published_at: string;
  impact_score: number;
  impact_assessment?: string;
};

export async function fetchNews(
  limit?: number,
  minImpact?: number
): Promise<NewsItem[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (minImpact != null) params.set('min_impact', String(minImpact));
  const { data } = await api.get<{ news: NewsItem[] }>(
    `/api/news?${params.toString()}`
  );
  return data.news || [];
}

export async function syncNews(useAi = true, limit = 20): Promise<{ synced: number }> {
  const params = new URLSearchParams();
  params.set('use_ai', String(useAi));
  params.set('limit', String(limit));
  const { data } = await api.post<{ synced: number }>(`/api/news/sync?${params.toString()}`);
  return data;
}

// Levels
export type Level = {
  id: string;
  price: number;
  type: 'support' | 'resistance';
  label: string | null;
  active: boolean;
  alert_threshold: number;
};

export async function fetchLevels(activeOnly = true): Promise<Level[]> {
  const { data } = await api.get<{ levels: Level[] }>(
    `/api/levels?active_only=${activeOnly}`
  );
  return data.levels || [];
}

export type LevelCreateInput = {
  price: number;
  type: 'support' | 'resistance';
  label?: string;
  alert_threshold?: number;
};

export type LevelUpdateInput = {
  price?: number;
  type?: 'support' | 'resistance';
  label?: string;
  active?: boolean;
  alert_threshold?: number;
};

export async function createLevel(input: LevelCreateInput): Promise<Level> {
  const { data } = await api.post<Level>('/api/levels', input);
  return data;
}

export async function updateLevel(id: string, input: LevelUpdateInput): Promise<Level> {
  const { data } = await api.patch<Level>(`/api/levels/${id}`, input);
  return data;
}

export async function deleteLevel(id: string): Promise<void> {
  await api.delete(`/api/levels/${id}`);
}

// Trades
export type Trade = {
  id: string;
  entry_price: number;
  exit_price: number | null;
  direction: 'long' | 'short';
  lot_size?: number;
  rr_ratio?: number;
  setup_description?: string;
  session?: string;
  news_day?: boolean;
  outcome?: string;
  pnl_dollars?: number;
  entry_time?: string;
  exit_time?: string;
  notes?: string;
};

export async function fetchTrades(limit?: number, outcome?: string): Promise<Trade[]> {
  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));
  if (outcome) params.set('outcome', outcome);
  const { data } = await api.get<{ trades: Trade[] }>(
    `/api/trades?${params.toString()}`
  );
  return data.trades || [];
}

export type TradeCreateInput = {
  entry_price: number;
  direction: 'long' | 'short';
  lot_size?: number;
  rr_ratio?: number;
  setup_description?: string;
  session?: 'london' | 'new_york' | 'asian' | 'overlap';
  news_day?: boolean;
  notes?: string;
};

export type TradeUpdateInput = {
  exit_price?: number;
  outcome?: 'win' | 'loss' | 'breakeven' | 'open';
  pnl_dollars?: number;
  notes?: string;
};

export async function createTrade(input: TradeCreateInput): Promise<Trade> {
  const { data } = await api.post<Trade>('/api/trades', input);
  return data;
}

export async function updateTrade(id: string, input: TradeUpdateInput): Promise<Trade> {
  const { data } = await api.patch<Trade>(`/api/trades/${id}`, input);
  return data;
}

// Reports
export type Report = {
  id: string;
  week_start?: string | null;
  content: Record<string, unknown> | null;
  delivered_at: string | null;
};

export async function fetchReports(limit?: number): Promise<Report[]> {
  const params = limit ? `?limit=${limit}` : '';
  const { data } = await api.get<{ reports: Report[] }>(`/api/reports${params}`);
  return data.reports || [];
}

export async function triggerDailyBrief(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>('/api/reports/daily');
  return data;
}

export async function triggerWeeklyReport(): Promise<Record<string, unknown>> {
  const { data } = await api.post<Record<string, unknown>>('/api/reports/weekly');
  return data;
}

// Alerts
export type Alert = {
  id: string;
  type: string;
  message: string;
  channel?: string;
  fired_at: string;
  metadata?: Record<string, unknown>;
};

export async function fetchAlerts(limit?: number): Promise<Alert[]> {
  const params = limit ? `?limit=${limit}` : '';
  const { data } = await api.get<{ alerts: Alert[] }>(`/api/alerts${params}`);
  return data.alerts || [];
}

// Trade insights
export type TradeInsights = {
  best_setup?: string;
  weak_setup?: string;
  session_performance?: string;
  news_day_impact?: string;
  recommendations?: string[];
  insights?: string;
  trade_count?: number;
};

export async function fetchTradeInsights(): Promise<TradeInsights> {
  const { data } = await api.get<TradeInsights>('/api/trades/insights');
  return data;
}
