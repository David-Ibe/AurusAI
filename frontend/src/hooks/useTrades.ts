import { useQuery } from '@tanstack/react-query';
import { fetchTrades } from '../lib/api';

export function useTrades(limit?: number, outcome?: string) {
  return useQuery({
    queryKey: ['trades', limit, outcome],
    queryFn: () => fetchTrades(limit, outcome),
    refetchInterval: 30_000,
  });
}
