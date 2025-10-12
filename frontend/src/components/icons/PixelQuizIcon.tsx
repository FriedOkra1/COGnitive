import React from 'react';

export function PixelQuizIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="8" width="40" height="48" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="14" y="10" width="36" height="44" fill="white"/>
      <rect x="20" y="16" width="4" height="4" fill="black"/>
      <rect x="28" y="16" width="16" height="4" fill="black"/>
      <rect x="20" y="24" width="4" height="4" fill="black"/>
      <rect x="28" y="24" width="16" height="4" fill="black"/>
      <rect x="20" y="32" width="4" height="4" fill="black"/>
      <rect x="28" y="32" width="16" height="4" fill="black"/>
      <rect x="20" y="40" width="4" height="4" fill="black"/>
      <rect x="28" y="40" width="16" height="4" fill="black"/>
    </svg>
  );
}
