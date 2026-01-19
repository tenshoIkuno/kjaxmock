import { useQuery } from '@tanstack/react-query';
import type { Alert } from '../types';

const ALERTS_URL = '/alerts.json';

export const fetchAlerts = async (): Promise<Alert[]> => {
  const res = await fetch(ALERTS_URL);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const data = await res.json();
  return data as Alert[];
};

export const useAlerts = () => {
  return useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 10 * 1000,
    cacheTime: 60 * 1000,
  });
};
