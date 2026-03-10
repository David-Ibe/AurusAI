import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '../lib/api';

export function useCalendar(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ['calendar', fromDate, toDate],
    queryFn: () => fetchCalendarEvents(fromDate, toDate),
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });
}
