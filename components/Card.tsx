import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, onClick, title, action }) => {
  return (
    <div 
      onClick={onClick}
      style={style}
      className={`bg-surface border border-slate-200 shadow-soft animate-fade-in rounded-2xl p-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-primary hover:shadow-float hover:-translate-y-1' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-bold text-textMain">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
