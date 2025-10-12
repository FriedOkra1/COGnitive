import React from 'react';

export function VideoIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="video-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff7a73" />
          <stop offset="50%" stopColor="#ff6059" />
          <stop offset="100%" stopColor="#e54942" />
        </linearGradient>
        <linearGradient id="video-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="video-shadow">
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
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#video-bg)" filter="url(#video-shadow)" opacity="0.4"/>
      
      {/* Main background */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#video-bg)"/>
      
      {/* Glossy overlay */}
      <rect x="4" y="4" width="56" height="28" rx="14" fill="url(#video-shine)"/>
      
      {/* Border */}
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none"/>
      
      {/* Film reel icon */}
      <g transform="translate(16, 16)">
        {/* Film strip */}
        <rect x="4" y="4" width="24" height="24" rx="2" fill="white" opacity="0.95"/>
        
        {/* Film holes - left */}
        <circle cx="6" cy="8" r="1" fill="#ff6059" opacity="0.6"/>
        <circle cx="6" cy="16" r="1" fill="#ff6059" opacity="0.6"/>
        <circle cx="6" cy="24" r="1" fill="#ff6059" opacity="0.6"/>
        
        {/* Film holes - right */}
        <circle cx="26" cy="8" r="1" fill="#ff6059" opacity="0.6"/>
        <circle cx="26" cy="16" r="1" fill="#ff6059" opacity="0.6"/>
        <circle cx="26" cy="24" r="1" fill="#ff6059" opacity="0.6"/>
        
        {/* Play button */}
        <circle cx="16" cy="16" r="6" fill="#ff6059" opacity="0.3"/>
        <path d="M14 12 L14 20 L20 16 Z" fill="white" opacity="0.9"/>
        
        {/* Film frames */}
        <line x1="4" y1="12" x2="28" y2="12" stroke="#ff6059" strokeWidth="0.5" opacity="0.3"/>
        <line x1="4" y1="20" x2="28" y2="20" stroke="#ff6059" strokeWidth="0.5" opacity="0.3"/>
      </g>
      
      {/* Inner highlight */}
      <rect x="8" y="8" width="48" height="20" rx="10" fill="white" opacity="0.15"/>
    </svg>
  );
}
