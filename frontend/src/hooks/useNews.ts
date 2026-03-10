import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../lib/api';

export function useNews(limit?: number, minImpact?: number) {
  return useQuery({
    queryKey: ['news', limit, minImpact],
    queryFn: () => fetchNews(limit, minImpact),
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });
}
