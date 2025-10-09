import React from 'react';

export function PixelDocIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="8" width="32" height="48" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="18" y="10" width="28" height="44" fill="white"/>
      <rect x="24" y="16" width="16" height="4" fill="black"/>
      <rect x="24" y="24" width="16" height="4" fill="black"/>
      <rect x="24" y="32" width="12" height="4" fill="black"/>
      <rect x="24" y="40" width="16" height="4" fill="black"/>
    </svg>
  );
}
