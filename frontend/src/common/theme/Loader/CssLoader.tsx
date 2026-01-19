import { Box, type MantineLoaderComponent } from '@mantine/core';
import { forwardRef } from 'react';

// Replace the old CSS-based single-dot loader with animated concentric rings.
export const CssLoader: MantineLoaderComponent = forwardRef(
  ({ size = 24, className, style, ...others }, ref) => {
    const s = typeof size === 'number' ? size : parseInt(String(size), 10) || 24;
    const ringStyle = (i: number) => ({
      position: 'absolute' as const,
      width: s - i * Math.round(s * 0.28),
      height: s - i * Math.round(s * 0.28),
      borderRadius: '50%',
      border: `${Math.max(1, Math.round(s * 0.08))}px solid rgba(33,150,243,${0.28 + i * 0.2})`,
      boxSizing: 'border-box' as const,
      top: (s - (s - i * Math.round(s * 0.28))) / 2,
      left: (s - (s - i * Math.round(s * 0.28))) / 2,
      animation: `loader-pulse-${i} ${1000 + i * 120}ms ${i * 90}ms infinite cubic-bezier(.4,0,.2,1)`,
      willChange: 'transform, opacity',
      display: 'block',
    });

    return (
      <Box component="span" ref={ref} className={className} style={{ display: 'inline-block', width: s, height: s, position: 'relative', ...style }} {...others}>
        <style>{`
          @keyframes loader-pulse-0 { 0% { transform: scale(.88); opacity: .24 } 50% { transform: scale(1.08); opacity: .72 } 100% { transform: scale(.88); opacity: .24 } }
          @keyframes loader-pulse-1 { 0% { transform: scale(.9); opacity: .2 } 50% { transform: scale(1.04); opacity: .56 } 100% { transform: scale(.9); opacity: .2 } }
          @keyframes loader-pulse-2 { 0% { transform: scale(.92); opacity: .16 } 50% { transform: scale(1.02); opacity: .42 } 100% { transform: scale(.92); opacity: .16 } }
        `}</style>
        <div aria-hidden style={ringStyle(2)} />
        <div aria-hidden style={ringStyle(1)} />
        <div aria-hidden style={ringStyle(0)} />
      </Box>
    );
  },
);
