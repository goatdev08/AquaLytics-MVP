import React from 'react';
import { Card } from '@/components/ui/Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, isLoading }) => {
  return (
    <Card loading={isLoading} noPadding>
      <div className="p-4">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          {icon}
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard; 