import React from 'react';

export function PixelMicIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="12" width="16" height="24" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="26" y="14" width="12" height="20" fill="white"/>
      <rect x="20" y="40" width="24" height="8" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="22" y="42" width="20" height="4" fill="white"/>
      <rect x="30" y="48" width="4" height="8" fill="black"/>
      <rect x="24" y="56" width="16" height="4" fill="black"/>
    </svg>
  );
}
