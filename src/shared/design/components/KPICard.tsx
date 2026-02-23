import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  delta,
  icon,
  subtitle,
  trend,
  className = '',
}) => {
  const getTrendColor = () => {
    if (!delta) return '';
    return delta.isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (!delta) return null;
    return delta.isPositive ? (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {delta && (
          <span className={`inline-flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
            {getTrendIcon()}
            {Math.abs(delta.value)}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

export default KPICard;








