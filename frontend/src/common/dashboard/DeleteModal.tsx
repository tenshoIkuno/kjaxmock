import { Button, Modal, Stack, Text } from '@mantine/core';

type DeleteModalProps = {
  opened: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteModal = ({
  opened,
  title = '削除しますか？',
  message = 'この操作は取り消せません。',
  onConfirm,
  onCancel,
}: DeleteModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={title}
      centered
      data-modal-root
      zIndex={1000}
    >
      <Stack gap="md">
        <Text size="sm">{message}</Text>

        <Stack gap="xs">
          <Button color="red" onClick={onConfirm}>
            削除する
          </Button>
          <Button variant="light" onClick={onCancel}>
            キャンセル
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
};
