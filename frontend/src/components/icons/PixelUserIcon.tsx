import React from 'react';

export function PixelUserIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="4" width="8" height="8" fill="black"/>
      <rect x="4" y="14" width="16" height="8" fill="black"/>
    </svg>
  );
}
