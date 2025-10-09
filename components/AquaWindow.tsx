import React from 'react';
import { X, Minus, Maximize2 } from 'lucide-react';

interface AquaWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function AquaWindow({ title, children, onClose, className = '' }: AquaWindowProps) {
  return (
    <div className={`aqua-window overflow-hidden ${className}`}>
      <div className="aqua-titlebar">
        <div className="traffic-lights">
          <button 
            onClick={onClose}
            className="traffic-light traffic-light-red cursor-pointer hover:brightness-110 transition-all"
            title="Close"
          />
          <button 
            className="traffic-light traffic-light-yellow cursor-pointer hover:brightness-110 transition-all"
            title="Minimize"
          />
          <button 
            className="traffic-light traffic-light-green cursor-pointer hover:brightness-110 transition-all"
            title="Maximize"
          />
        </div>
        <div className="flex-1 text-center text-sm opacity-80">{title}</div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
