import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}

export function FeatureCard({ icon, title, description, onClick, gradient }: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className="aqua-card p-8 cursor-pointer group"
    >
      <div className={`w-20 h-20 rounded-2xl ${gradient} glossy-overlay flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="text-sm opacity-70">{description}</p>
    </div>
  );
}
