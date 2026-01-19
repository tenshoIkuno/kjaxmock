import { List } from '@/common/dashboard/List';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useTenant } from '@/features/settings/hooks/useTenants';
import { LoadingOverlay, Stack, Text, Select, Button, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';

const tenantUserColumns = (roles: Record<string, string>, setRole: (email: string, role: string) => void) => [
  { key: 'name', label: '名前' },
  { key: 'email', label: 'メールアドレス' },
  {
    key: 'role',
    label: '役割',
    // left align header/cells to match other columns
    align: 'left',
    width: 260,
    render: (row: any) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Select
          data={['管理者', '担当税理士', '上長', '担当職員']}
          placeholder="役割を選択してください"
          value={roles[row.email] ?? ''}
          onChange={(v) => setRole(row.email, v ?? '')}
          size="sm"
          style={{ minWidth: 220 }}
          // make the select look like the screenshot: rightmost column with a consistent width
        />
      </div>
    ),
  },
] as const;

export const TenatPanel = () => {
  // storeからuser情報取得
  const user = useAuthStore((s) => s.user);

  const tenantId = user?.tenant_id;
  // テナント情報取得
  const { data: tenant, isLoading, isError } = useTenant(tenantId!);

  // local role state keyed by email to support mock selection UI
  const [roles, setRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tenant?.users) {
      const initial: Record<string, string> = {};
      tenant.users.forEach((u: any) => {
        // no role present in mock data — default to empty so placeholder shows
        initial[u.email] = u.role ?? '';
      });
      setRoles(initial);
    }
  }, [tenant]);

  const setRole = (email: string, role: string) => {
    setRoles((s) => ({ ...s, [email]: role }));
  };

  return (
    <Stack mt="xs" gap="xs">
      <Text fw={600}>ユーザ一覧</Text>
      {isLoading ? (
        <LoadingOverlay visible={isLoading} zIndex={1000} />
      ) : isError ? (
        <Text>テナント情報の取得に失敗しました</Text>
      ) : (
        <>
          <List columns={tenantUserColumns(roles, setRole)} data={tenant?.users ?? []} />
          <Group position="center" mt="md">
            <Button
              fullWidth
              variant="light"
              onClick={() => {
                // persist not implemented for mock; show notification
                notifications.show({ title: '更新', message: '役割を更新しました（モック）', color: 'green' });
              }}
            >
              更新
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
};
