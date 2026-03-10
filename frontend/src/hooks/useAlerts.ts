import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../lib/api';

export function useAlerts(limit?: number) {
  return useQuery({
    queryKey: ['alerts', limit],
    queryFn: () => fetchAlerts(limit),
    refetchInterval: 30_000,
  });
}
