import { useQuery } from '@tanstack/react-query';
import { fetchLevels } from '../lib/api';

export function useLevels(activeOnly = true) {
  return useQuery({
    queryKey: ['levels', activeOnly],
    queryFn: () => fetchLevels(activeOnly),
    refetchInterval: 30_000,
  });
}
