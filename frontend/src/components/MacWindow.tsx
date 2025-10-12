import React, { useState } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface MacWindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export function MacWindow({ 
  title, 
  children, 
  onClose, 
  onMinimize, 
  isMaximized,
  onToggleMaximize 
}: MacWindowProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div 
      className={`absolute ${
        isMaximized 
          ? 'inset-6 top-12' 
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl h-[85%]'
      } flex flex-col transition-all duration-300`}
      style={{ zIndex: 100 }}
    >
      {/* Window */}
      <div className="aqua-window flex flex-col h-full shadow-2xl">
        {/* Title bar */}
        <div 
          className="aqua-titlebar flex-shrink-0"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="traffic-light traffic-light-red hover:brightness-110 transition-all group relative"
              aria-label="Close"
            >
              {showControls && (
                <X className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8b0000]" strokeWidth={3} />
              )}
            </button>
            <button 
              onClick={onMinimize}
              className="traffic-light traffic-light-yellow hover:brightness-110 transition-all group relative"
              aria-label="Minimize"
            >
              {showControls && (
                <Minus className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8b6914]" strokeWidth={3} />
              )}
            </button>
            <button 
              onClick={onToggleMaximize}
              className="traffic-light traffic-light-green hover:brightness-110 transition-all group relative"
              aria-label={isMaximized ? "Restore" : "Maximize"}
            >
              {showControls && (
                isMaximized ? (
                  <Minimize2 className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#006400]" strokeWidth={3} />
                ) : (
                  <Maximize2 className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#006400]" strokeWidth={3} />
                )
              )}
            </button>
          </div>
          
          {/* Window title */}
          <div className="flex-1 text-center text-sm opacity-80 select-none">
            {title}
          </div>

          {/* Spacer for symmetry */}
          <div className="w-[68px]"></div>
        </div>

        {/* Window content */}
        <div className="flex-1 overflow-auto p-6 bg-white/40 rounded-b-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
