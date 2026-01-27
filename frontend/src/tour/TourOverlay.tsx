import React from 'react';
import { createPortal } from 'react-dom';

type Rect = { top: number; left: number; width: number; height: number } | null;

function Highlight({ rect }: { rect: Rect }) {
  if (!rect) return null;
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.top - 8,
    left: rect.left - 8,
    width: rect.width + 16,
    height: rect.height + 16,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
    border: '2px solid rgba(255,255,255,0.95)',
    borderRadius: 8,
    pointerEvents: 'none',
    transition: 'all 200ms ease',
    zIndex: 10001,
  };
  return <div style={style} />;
}

export default function TourOverlay({ rect }: { rect: Rect }) {
  const root = document.body;
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // focus overlay so it can capture Tab and key events
    try {
      overlayRef.current?.focus();
    } catch (e) {
      // ignore
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // prevent tabbing while overlay active
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    // if click is inside highlight rect, forward the click to the underlying element
    if (rect) {
      const x = e.clientX;
      const y = e.clientY;
      if (
        x >= rect.left - 8 &&
        x <= rect.left + rect.width + 8 &&
        y >= rect.top - 8 &&
        y <= rect.top + rect.height + 8
      ) {
        const el = document.elementFromPoint(x, y) as HTMLElement | null;
        if (el && overlayRef.current && overlayRef.current.contains(el)) {
          // elementFromPoint returned overlay itself; try one pixel offset inside
          const el2 = document.elementFromPoint(
            x + 1,
            y + 1,
          ) as HTMLElement | null;
          if (el2 && el2 !== overlayRef.current) {
            el2.click();
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        } else if (el) {
          el.click();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    }
    // otherwise block interaction
    e.preventDefault();
    e.stopPropagation();
  };
  return createPortal(
    <>
      <div
        ref={overlayRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />
      <Highlight rect={rect} />
    </>,
    root,
  );
}
