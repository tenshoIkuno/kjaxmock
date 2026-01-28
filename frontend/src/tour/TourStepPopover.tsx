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
  const style: React.CSSProperties & {
    popoverWidth?: number;
    placement?: 'below' | 'above';
  } = rect
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
        let placement: 'below' | 'above' = 'below';
        if (belowTop + estimatedHeight > viewportH - minMargin) {
          // place above
          top = Math.max(minMargin, rect.top - 12 - estimatedHeight);
          placement = 'above';
        }

        const maxWidth = Math.min(preferredWidth, viewportW - minMargin * 2);

        return {
          position: 'fixed' as const,
          top,
          left,
          zIndex: 20000,
          minWidth: 280,
          maxWidth,
          overflow: 'auto' as const,
          popoverWidth: maxWidth,
          placement,
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

  // compute tail (triangle) position relative to popover when we have a rect
  let tailStyle: React.CSSProperties | null = null;
  let containerStyle: React.CSSProperties = {};
  if (rect && style.popoverWidth && style.placement) {
    const popW = Math.max(280, style.popoverWidth);
    const popLeft = style.left as number;
    const targetCenter = rect.left + rect.width / 2;
    // compute tail left relative to popover
    const tailWidth = 16; // visual width of triangle base
    let tailLeft = targetCenter - popLeft - tailWidth / 2;
    const minTail = 12;
    const maxTail = popW - minTail - tailWidth;
    if (tailLeft < minTail) tailLeft = minTail;
    if (tailLeft > maxTail) tailLeft = maxTail;

    const isBelow = style.placement === 'below';
    tailStyle = {
      position: 'absolute',
      left: tailLeft,
      width: 0,
      height: 0,
      borderLeft: `${tailWidth / 2}px solid transparent`,
      borderRight: `${tailWidth / 2}px solid transparent`,
      ...(isBelow
        ? { borderTop: `12px solid white`, top: -12 }
        : { borderBottom: `12px solid white`, bottom: -12 }),
      // ensure tail sits above overlay border/shadow
      zIndex: 20001,
    };

    containerStyle = { position: 'relative' };
  }

  return (
    <div style={style}>
      <div style={containerStyle}>
        {tailStyle && <div style={tailStyle} />}
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
              (step.requiredAction as any).type === 'click' ? null : index < // progression happens when the user clicks the target element. // for click-required steps we do not render a 次へ/完了ボタン;
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
    </div>
  );
}
