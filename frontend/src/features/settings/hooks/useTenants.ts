import { getTenant } from '@/features/settings/api/tenants';
import { useQuery } from '@tanstack/react-query';

// テナント情報を取得するフック
export const useTenant = (tenantId: string) => {
  const query = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => getTenant(tenantId),
    enabled: !!tenantId,
  });

  return query;
};
