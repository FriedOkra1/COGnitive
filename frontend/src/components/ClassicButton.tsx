import React from 'react';

interface ClassicButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'primary';
  className?: string;
  disabled?: boolean;
}

export function ClassicButton({ onClick, children, variant = 'default', className = '', disabled = false }: ClassicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`mac-button ${className}`}
      disabled={disabled}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
    >
      {children}
    </button>
  );
}
