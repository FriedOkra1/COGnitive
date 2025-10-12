import React from 'react';

interface ClassicButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
}

export function ClassicButton({ onClick, children, variant = 'default', className = '' }: ClassicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`mac-button ${className}`}
    >
      {children}
    </button>
  );
}
