import { useQuery } from '@tanstack/react-query';
import { fetchPrice } from '../lib/api';

export function useGoldPrice() {
  return useQuery({
    queryKey: ['goldPrice'],
    queryFn: fetchPrice,
    refetchInterval: 60000, // 60s — backend caches 5min; reduces FMP rate limits
    staleTime: 45000,
  });
}
