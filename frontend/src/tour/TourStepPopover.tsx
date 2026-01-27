import React from 'react';
import { Paper, Title, Text, Group, Button } from '@mantine/core';
import type { TourStep } from './tourTypes';

type Props = {
  step: TourStep;
  rect: { top: number; left: number; width: number; height: number } | null;
  onNext: () => void;
  onComplete: () => void;
  index: number;
  total: number;
};

export default function TourStepPopover({
  step,
  rect,
  onNext,
  onComplete,
  index,
  total,
}: Props) {
  // compute position but clamp to viewport so the popover won't overflow
  const style: React.CSSProperties = rect
    ? (() => {
        const minMargin = 8;
        const preferredWidth = 320;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        let left = rect.left;
        // clamp left so popover fits horizontally
        if (left + preferredWidth > viewportW - minMargin) {
          left = Math.max(minMargin, viewportW - minMargin - preferredWidth);
        }
        if (left < minMargin) left = minMargin;

        // preferred placement is below; if not enough space, place above
        const belowTop = rect.top + rect.height + 12;
        const estimatedHeight = 200; // conservative estimate for clamping
        let top = belowTop;
        if (belowTop + estimatedHeight > viewportH - minMargin) {
          // place above
          top = Math.max(minMargin, rect.top - 12 - estimatedHeight);
        }

        return {
          position: 'fixed' as const,
          top,
          left,
          zIndex: 20000,
          minWidth: 280,
          maxWidth: Math.min(preferredWidth, viewportW - minMargin * 2),
          overflow: 'auto' as const,
        };
      })()
    : {
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20000,
        maxWidth: 'calc(100vw - 32px)',
      };

  return (
    <div style={style}>
      <Paper withBorder p="md" radius="md" style={{ minWidth: 280 }}>
        <Title order={6}>{step.title}</Title>
        <Text size="sm" style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
          {step.description}
        </Text>
        <Group position="apart" mt="md">
          <div />
          <div>
            {/* If this step requires a click (requiredAction type=click), hide the 次へ button
                      and rely on the user clicking the target; otherwise show 次へ/完了 */}
            {step.requiredAction &&
            (step.requiredAction as any).type === 'click' ? null : index < // progression happens when the user clicks the target element. // for click-required steps we do not render a 次へ/完了 button;
              total - 1 ? (
              <Button size="xs" onClick={onNext}>
                次へ
              </Button>
            ) : (
              <Button size="xs" onClick={onComplete}>
                完了
              </Button>
            )}
          </div>
        </Group>
      </Paper>
    </div>
  );
}
