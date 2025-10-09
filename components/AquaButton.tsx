import React from 'react';

interface AquaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'blue' | 'green' | 'red' | 'graphite';
  children: React.ReactNode;
}

export function AquaButton({ variant = 'blue', children, className = '', ...props }: AquaButtonProps) {
  const variantClass = 
    variant === 'green' ? 'aqua-button-green' : 
    variant === 'red' ? 'aqua-button-red' :
    'aqua-button';
  
  return (
    <button
      className={`${variantClass} glossy-overlay px-6 py-3 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
