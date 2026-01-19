import { DashboardModal } from '@/common/dashboard/Modal';
import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';
import { Button, Group, Stack, Text } from '@mantine/core';

type PatrolAuditCheckModalProps = {
  opened: boolean;
  onClose: () => void;
  formValues: inputPatrolAudit;
};

export const PatrolAuditCheckModal = ({
  opened,
  onClose,
}: PatrolAuditCheckModalProps) => {
  return (
    <DashboardModal opened={opened} onClose={onClose} title="確認">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          入力した内容を保存しますか？
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="outline">下書き保存</Button>
          <Button>公開</Button>
        </Group>
      </Stack>
    </DashboardModal>
  );
};
