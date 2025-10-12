import React from 'react';

interface PixelNoteIconProps {
  size?: number;
}

export function PixelNoteIcon({ size = 24 }: PixelNoteIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document with lines */}
      <rect x="5" y="2" width="14" height="20" fill="white" stroke="black" strokeWidth="1.5"/>
      
      {/* Text lines */}
      <line x1="8" y1="6" x2="16" y2="6" stroke="black" strokeWidth="1.5"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="black" strokeWidth="1.5"/>
      <line x1="8" y1="14" x2="14" y2="14" stroke="black" strokeWidth="1.5"/>
      <line x1="8" y1="18" x2="12" y2="18" stroke="black" strokeWidth="1.5"/>
    </svg>
  );
}
