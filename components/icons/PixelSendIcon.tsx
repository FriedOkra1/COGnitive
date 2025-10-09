import React from 'react';

export function PixelSendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="2,2 14,8 2,14 2,9 10,8 2,7" fill="currentColor"/>
    </svg>
  );
}
