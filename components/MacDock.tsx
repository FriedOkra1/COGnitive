import React from 'react';

interface DockApp {
  id: string;
  icon: React.ReactNode;
  label: string;
  isMinimized?: boolean;
}

interface MacDockProps {
  apps: DockApp[];
  onAppClick: (id: string) => void;
}

export function MacDock({ apps, onAppClick }: MacDockProps) {
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl px-3 py-2 shadow-2xl">
        <div className="flex items-end gap-2">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onAppClick(app.id)}
              className="group relative transition-all duration-200 hover:scale-110 hover:-translate-y-2"
              title={app.label}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                {app.icon}
              </div>
              {app.isMinimized && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg"></div>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {app.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
