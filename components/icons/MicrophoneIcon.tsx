import React from 'react';

export function MicrophoneIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mic-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6bb4ff" />
          <stop offset="50%" stopColor="#3f9eff" />
          <stop offset="100%" stopColor="#2b7cd3" />
        </linearGradient>
        <linearGradient id="mic-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="mic-shadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Shadow */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#mic-bg)" filter="url(#mic-shadow)" opacity="0.4"/>
      
      {/* Main background */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#mic-bg)"/>
      
      {/* Glossy overlay */}
      <rect x="4" y="4" width="56" height="28" rx="14" fill="url(#mic-shine)"/>
      
      {/* Border */}
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none"/>
      
      {/* Microphone icon */}
      <g transform="translate(20, 16)">
        {/* Mic body */}
        <rect x="8" y="4" width="8" height="14" rx="4" fill="white" opacity="0.95"/>
        
        {/* Mic stand */}
        <path d="M12 18 L12 26" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.95"/>
        
        {/* Mic base */}
        <line x1="8" y1="26" x2="16" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.95"/>
        
        {/* Mic arc */}
        <path d="M4 14 Q4 22 12 22 Q20 22 20 14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.95"/>
        
        {/* Sound waves */}
        <path d="M2 10 Q0 14 2 18" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
        <path d="M22 10 Q24 14 22 18" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
      </g>
      
      {/* Inner highlight */}
      <rect x="8" y="8" width="48" height="20" rx="10" fill="white" opacity="0.15"/>
    </svg>
  );
}
