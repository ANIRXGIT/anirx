import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = "font-bold rounded-lg px-4 py-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center";
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover shadow-md",
    secondary: "bg-surface border border-border text-text hover:bg-surface-hover",
    danger: "bg-error/10 border border-error/20 text-error hover:bg-error hover:text-white",
    ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
