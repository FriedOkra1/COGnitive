import React from 'react';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function DesktopIcon({ icon, label, onClick }: DesktopIconProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/20 transition-all group w-20"
    >
      <div className="w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs text-white text-center px-1 py-0.5 rounded bg-black/40 group-hover:bg-black/60 transition-colors shadow-sm">
        {label}
      </div>
    </button>
  );
}
