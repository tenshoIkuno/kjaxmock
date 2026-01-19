import { useQuery } from '@tanstack/react-query';
import type { NotificationItem } from '../types';

const NOTIFICATIONS_URL = '/notifications.json';

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const res = await fetch(NOTIFICATIONS_URL);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const data = await res.json();
  return data as NotificationItem[];
};

export const useNotifications = () => {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    // keep short stale time for dev
    staleTime: 10 * 1000,
    cacheTime: 60 * 1000,
  });
};
