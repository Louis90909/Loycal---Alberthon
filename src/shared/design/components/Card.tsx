import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  elevated = false,
  onClick,
  hoverable = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseClasses = `
    bg-white rounded-2xl border border-gray-200
    ${elevated ? 'shadow-lg' : 'shadow-sm'}
    ${hoverable || onClick ? 'hover:shadow-md transition-shadow duration-200 cursor-pointer' : ''}
    ${paddingClasses[padding]}
  `;

  return (
    <div className={`${baseClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
};






