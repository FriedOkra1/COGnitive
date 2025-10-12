import React from 'react';

export function ChatIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chat-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7ae57a" />
          <stop offset="50%" stopColor="#5dd25d" />
          <stop offset="100%" stopColor="#45b845" />
        </linearGradient>
        <linearGradient id="chat-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="chat-shadow">
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
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#chat-bg)" filter="url(#chat-shadow)" opacity="0.4"/>
      
      {/* Main background */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#chat-bg)"/>
      
      {/* Glossy overlay */}
      <rect x="4" y="4" width="56" height="28" rx="14" fill="url(#chat-shine)"/>
      
      {/* Border */}
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none"/>
      
      {/* Chat bubbles icon */}
      <g transform="translate(14, 16)">
        {/* Back bubble */}
        <path d="M8 16 L8 8 C8 6.9 8.9 6 10 6 L26 6 C27.1 6 28 6.9 28 8 L28 16 C28 17.1 27.1 18 26 18 L22 18 L18 22 L18 18 L10 18 C8.9 18 8 17.1 8 16 Z" 
              fill="white" opacity="0.7"/>
        
        {/* Front bubble */}
        <path d="M4 12 L4 4 C4 2.9 4.9 2 6 2 L22 2 C23.1 2 24 2.9 24 4 L24 12 C24 13.1 23.1 14 22 14 L18 14 L14 18 L14 14 L6 14 C4.9 14 4 13.1 4 12 Z" 
              fill="white" opacity="0.95"/>
        
        {/* Chat dots */}
        <circle cx="10" cy="8" r="1.5" fill="#5dd25d" opacity="0.6"/>
        <circle cx="14" cy="8" r="1.5" fill="#5dd25d" opacity="0.6"/>
        <circle cx="18" cy="8" r="1.5" fill="#5dd25d" opacity="0.6"/>
      </g>
      
      {/* Inner highlight */}
      <rect x="8" y="8" width="48" height="20" rx="10" fill="white" opacity="0.15"/>
    </svg>
  );
}
