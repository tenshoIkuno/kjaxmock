import { Modal } from '@mantine/core';

/**
 * Props for `DashboardModal` wrapper.
 *
 * This is a thin, well-typed wrapper around Mantine's `Modal` used across the
 * dashboard to provide a consistent default size and centering.
 */
export interface DashboardModalProps {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Mantine `size` prop (keeps default `lg`). */
  size?: React.ComponentProps<typeof Modal>['size'];
  /** whether modal is centered on the screen (defaults to true) */
  centered?: boolean;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  opened,
  onClose,
  title,
  children,
  size = 'lg',
  centered = true,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      centered={centered}
    >
      <div style={{ userSelect: 'none' }}>{children}</div>
    </Modal>
  );
};

export default DashboardModal;
