import { useQuery } from '@tanstack/react-query';
import { fetchMacro } from '../lib/api';

export function useMacro() {
  return useQuery({
    queryKey: ['macro'],
    queryFn: fetchMacro,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
