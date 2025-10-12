import React from 'react';

export function PixelChatIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="32" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="10" y="14" width="44" height="28" fill="white"/>
      <rect x="16" y="20" width="32" height="4" fill="black"/>
      <rect x="16" y="28" width="24" height="4" fill="black"/>
      <polygon points="24,44 32,52 32,44" fill="black"/>
    </svg>
  );
}
