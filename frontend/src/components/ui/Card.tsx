import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({ children, className = '', onClick, padding = 'md' }: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={`
        bg-white rounded-2xl shadow-card border border-slate-100
        ${paddings[padding]}
        ${onClick ? 'w-full text-left active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
