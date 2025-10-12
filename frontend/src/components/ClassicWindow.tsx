import React from 'react';

interface ClassicWindowProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  width?: string;
}

export function ClassicWindow({ title, onClose, children, width = '800px' }: ClassicWindowProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="mac-window" style={{ width, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="mac-titlebar">
          <div className="mac-titlebar-pattern opacity-30" />
          <div className="flex items-center gap-3 relative z-10">
            {onClose && (
              <div className="mac-close-box" onClick={onClose} />
            )}
            <span className="text-xl">{title}</span>
          </div>
        </div>
        <div className="p-6 overflow-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
