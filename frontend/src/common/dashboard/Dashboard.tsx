import { Flex, Paper, ScrollArea, Text, Title } from '@mantine/core';
import React from 'react';

export interface DashboardLayoutProps {
  title: string;
  label?: string;
  actionButton?: React.ReactNode;
  filterArea?: React.ReactNode;
  children: React.ReactNode;
  /** compact mode reduces paddings for denser layouts */
  compact?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  label,
  actionButton,
  filterArea,
  children,
  compact = false,
}) => {
  return (
    <Flex direction="column" gap={15} sx={{ height: '100%' }} role="region" aria-label={title}>
      <Flex
        direction="row"
        align="center"
        justify="space-between"
        sx={{ marginBottom: 5 }}
      >
        <Flex direction="column">
          {/* タイトル */}
          <Title order={2}>{title}</Title>
          {/* ラベル */}
          {label ? <Text c="dimmed">{label}</Text> : null}
        </Flex>
        {/* ボタン */}
        {actionButton}
      </Flex>

      {/* 検索欄 */}
      {filterArea && (
        <Paper shadow="sm" radius="md" p={compact ? 'sm' : 'md'} withBorder>
          {filterArea}
        </Paper>
      )}

      {/* 子要素 */}
      <Paper
        shadow="sm"
        radius="md"
        p={compact ? 'sm' : 'md'}
        withBorder
        sx={{ flex: 1, minHeight: 0, display: 'flex' }}
      >
        <ScrollArea sx={{ flex: 1 }} offsetScrollbars>
          {children}
        </ScrollArea>
      </Paper>
    </Flex>
  );
};

export default DashboardLayout;
