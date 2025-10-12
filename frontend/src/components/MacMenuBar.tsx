import React from 'react';
import { Apple, Wifi, Battery, Volume2 } from 'lucide-react';

export function MacMenuBar() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const dateString = now.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="h-6 bg-gradient-to-b from-[rgba(235,235,240,0.95)] to-[rgba(215,215,220,0.95)] border-b border-black/10 backdrop-blur-md flex items-center justify-between px-4 text-xs shadow-sm">
      {/* Left side - Apple menu and app menus */}
      <div className="flex items-center gap-4">
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          <Apple className="w-3.5 h-3.5" />
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors font-semibold">
          COGnitive
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          File
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          Edit
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          View
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          Window
        </button>
        <button className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          Help
        </button>
      </div>

      {/* Right side - System icons and time */}
      <div className="flex items-center gap-3">
        <button className="hover:bg-white/30 p-1 rounded transition-colors">
          <Battery className="w-3.5 h-3.5" />
        </button>
        <button className="hover:bg-white/30 p-1 rounded transition-colors">
          <Wifi className="w-3.5 h-3.5" />
        </button>
        <button className="hover:bg-white/30 p-1 rounded transition-colors">
          <Volume2 className="w-3.5 h-3.5" />
        </button>
        <div className="hover:bg-white/30 px-2 py-0.5 rounded transition-colors">
          {dateString} {timeString}
        </div>
      </div>
    </div>
  );
}
