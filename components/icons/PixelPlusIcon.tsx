import React from 'react';

interface PixelPlusIconProps {
  size?: number;
}

export function PixelPlusIcon({ size = 24 }: PixelPlusIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="11" y="4" width="2" height="16" fill="black"/>
      <rect x="4" y="11" width="16" height="2" fill="black"/>
    </svg>
  );
}
