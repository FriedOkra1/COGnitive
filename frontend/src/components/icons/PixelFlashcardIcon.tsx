import React from 'react';

export function PixelFlashcardIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="12" width="40" height="28" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="18" y="14" width="36" height="24" fill="white"/>
      <rect x="24" y="20" width="24" height="4" fill="black"/>
      <rect x="24" y="28" width="16" height="4" fill="black"/>
      <rect x="8" y="24" width="40" height="28" fill="black" stroke="black" strokeWidth="2"/>
      <rect x="10" y="26" width="36" height="24" fill="white"/>
    </svg>
  );
}
