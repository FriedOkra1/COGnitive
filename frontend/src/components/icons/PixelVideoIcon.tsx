import React from 'react';

export function PixelVideoIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="48" height="32" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="10" y="18" width="44" height="28" fill="white"/>
      <path d="M 28 24 L 28 40 L 40 32 Z" fill="black"/>
    </svg>
  );
}
