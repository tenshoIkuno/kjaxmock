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
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  if (!rect) {
    return createPortal(
      <>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            pointerEvents: 'auto',
          }}
        />
      </>,
      root,
    );
  }

  // When rect exists, render four overlay panes around the rect so the rect area is clickable.
  const top = Math.max(0, rect.top - 8);
  const left = Math.max(0, rect.left - 8);
  const right = rect.left + rect.width + 8;
  const bottom = rect.top + rect.height + 8;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const rightWidth = Math.max(0, viewportW - right);
  const bottomHeight = Math.max(0, viewportH - bottom);

  return createPortal(
    <>
      {/* top */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: top,
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />
      {/* left */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: top,
          width: left,
          height: Math.max(0, bottom - top),
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />
      {/* right */}
      <div
        style={{
          position: 'fixed',
          left: right,
          top: top,
          width: rightWidth,
          height: Math.max(0, bottom - top),
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />
      {/* bottom */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: bottom,
          width: '100%',
          height: bottomHeight,
          zIndex: 10000,
          pointerEvents: 'auto',
        }}
      />

      <Highlight rect={rect} />
    </>,
    root,
  );
}
