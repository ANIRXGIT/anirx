import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-surface p-4 lg:p-6 rounded-2xl border border-border shadow-sm ${className}`}>
      {children}
    </div>
  );
}
