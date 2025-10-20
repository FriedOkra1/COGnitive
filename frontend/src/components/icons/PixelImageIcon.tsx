interface PixelImageIconProps {
  size?: number;
  color?: string;
}

export function PixelImageIcon({ size = 24, color = 'currentColor' }: PixelImageIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Image frame */}
      <rect x="3" y="3" width="18" height="18" stroke={color} strokeWidth="2" fill="none" />
      
      {/* Mountain/landscape */}
      <path d="M3 18 L8 13 L12 17 L18 11 L21 14 L21 21 L3 21 Z" fill={color} opacity="0.6" />
      
      {/* Sun/circle */}
      <circle cx="17" cy="8" r="2" fill={color} />
    </svg>
  );
}

