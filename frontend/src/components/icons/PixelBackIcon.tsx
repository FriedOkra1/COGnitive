import React from 'react';

export function PixelBackIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="7" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="5" width="2" height="2" fill="currentColor"/>
      <rect x="6" y="9" width="2" height="2" fill="currentColor"/>
      <rect x="8" y="3" width="2" height="2" fill="currentColor"/>
      <rect x="8" y="11" width="2" height="2" fill="currentColor"/>
      <rect x="10" y="3" width="4" height="2" fill="currentColor"/>
      <rect x="10" y="7" width="4" height="2" fill="currentColor"/>
      <rect x="10" y="11" width="4" height="2" fill="currentColor"/>
    </svg>
  );
}
