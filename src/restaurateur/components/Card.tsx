import React from 'react';

interface CardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, change, changeType, children }) => {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-surface rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
        {change && (
          <span className={`ml-2 text-sm font-medium ${changeColor}`}>
            {change}
          </span>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Card;