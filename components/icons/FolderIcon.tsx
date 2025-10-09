import React from 'react';

export function FolderIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="folder-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c57aff" />
          <stop offset="50%" stopColor="#b57aff" />
          <stop offset="100%" stopColor="#9357e5" />
        </linearGradient>
        <linearGradient id="folder-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id="folder-shadow">
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
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#folder-bg)" filter="url(#folder-shadow)" opacity="0.4"/>
      
      {/* Main background */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#folder-bg)"/>
      
      {/* Glossy overlay */}
      <rect x="4" y="4" width="56" height="28" rx="14" fill="url(#folder-shine)"/>
      
      {/* Border */}
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none"/>
      
      {/* Folder icon */}
      <g transform="translate(16, 20)">
        {/* Folder back */}
        <path d="M2 6 L2 26 C2 27.1 2.9 28 4 28 L28 28 C29.1 28 30 27.1 30 26 L30 10 C30 8.9 29.1 8 28 8 L14 8 L10 4 L4 4 C2.9 4 2 4.9 2 6 Z" 
              fill="white" opacity="0.95"/>
        
        {/* Folder tab */}
        <path d="M2 6 L10 6 L14 10 L28 10 C29.1 10 30 10.9 30 12 L30 10 C30 8.9 29.1 8 28 8 L14 8 L10 4 L4 4 C2.9 4 2 4.9 2 6 Z" 
              fill="white" opacity="0.8"/>
        
        {/* Document inside */}
        <rect x="8" y="14" width="16" height="2" rx="1" fill="rgba(181, 122, 255, 0.4)"/>
        <rect x="8" y="18" width="14" height="2" rx="1" fill="rgba(181, 122, 255, 0.3)"/>
        <rect x="8" y="22" width="12" height="2" rx="1" fill="rgba(181, 122, 255, 0.2)"/>
      </g>
      
      {/* Inner highlight */}
      <rect x="8" y="8" width="48" height="20" rx="10" fill="white" opacity="0.15"/>
    </svg>
  );
}
