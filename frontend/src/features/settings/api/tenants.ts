import type { TenantInfo } from '@/features/settings/types/tenants';

let cachedTenants: Record<string, TenantInfo> | null = null;

const loadTenants = async (): Promise<Record<string, TenantInfo>> => {
  if (cachedTenants) return cachedTenants;
  try {
    const res = await fetch('/mock-tenants.json');
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const data = await res.json();
    cachedTenants = data as Record<string, TenantInfo>;
    return cachedTenants;
  } catch (e) {
    // フェールした場合は最低限のフォールバックを返す
    const fallback: Record<string, TenantInfo> = {
      'tenant-1': {
        id: 'tenant-1',
        name: '顧問先1',
        users: [
          { name: '担当 太郎', email: 'taro@example.com' },
          { name: '担当 花子', email: 'hanako@example.com' },
        ],
      },
    };
    cachedTenants = fallback;
    return cachedTenants;
  }
};

export const getTenant = async (tenantId: string): Promise<TenantInfo> => {
  const tenants = await loadTenants();
  const t = tenants[tenantId];
  if (t) return t;
  // テーブルに存在しない場合は、tenantId から簡易的に顧問先名を生成して返す
  const m = tenantId.match(/(\d+)$/);
  const name = m ? `顧問先${m[1]}` : tenantId.replace(/^tenant-?/i, '') || '顧問先';
  return { id: tenantId, name, users: [] };
};
