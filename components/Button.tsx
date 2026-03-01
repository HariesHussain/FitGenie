import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary hover:bg-violet-500 text-white shadow-lg shadow-violet-900/50 focus:ring-violet-500",
    secondary: "bg-secondary hover:bg-cyan-300 text-slate-900 shadow-lg shadow-cyan-900/50 focus:ring-cyan-400",
    outline: "border-2 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-800 focus:ring-slate-500",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};