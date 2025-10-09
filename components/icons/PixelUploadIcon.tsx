import React from 'react';

interface PixelUploadIconProps {
  size?: number;
}

export function PixelUploadIcon({ size = 24 }: PixelUploadIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document outline */}
      <rect x="6" y="2" width="12" height="20" fill="white" stroke="black" strokeWidth="1"/>
      <path d="M6 2 L6 6 L10 6 L14 2" stroke="black" strokeWidth="1" fill="white"/>
      
      {/* Up arrow */}
      <rect x="11" y="11" width="2" height="7" fill="black"/>
      <path d="M12 8 L9 11 L11 11 L11 9 L13 9 L13 11 L15 11 Z" fill="black"/>
    </svg>
  );
}
