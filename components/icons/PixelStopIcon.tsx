import React from 'react';

export function PixelStopIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="32" height="32" fill="black" stroke="black" strokeWidth="2"/>
    </svg>
  );
}
