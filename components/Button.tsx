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
  const baseStyles = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";
  
  const variants = {
    primary: "bg-primary text-white shadow-sm hover:bg-primaryDark focus:ring-primary",
    secondary: "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus:ring-slate-500",
    outline: "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-400",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
