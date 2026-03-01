import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, title, action }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors ${className}`}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};