import React from 'react';

export function PixelBotIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="12" height="12" fill="black" stroke="black" strokeWidth="1"/>
      <rect x="8" y="8" width="3" height="3" fill="white"/>
      <rect x="13" y="8" width="3" height="3" fill="white"/>
      <rect x="9" y="14" width="6" height="2" fill="white"/>
    </svg>
  );
}
