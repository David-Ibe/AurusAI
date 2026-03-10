import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../lib/api';

export function useReports(limit?: number) {
  return useQuery({
    queryKey: ['reports', limit],
    queryFn: () => fetchReports(limit),
    refetchInterval: 5 * 60_000,
  });
}
