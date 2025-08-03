'use client';

import React from 'react';
import MetricCard from '@/components/ui/MetricCard';
import { Users, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  data: {
    total_swimmers?: number;
    active_competitions?: number;
    total_tests?: number;
  };
  isLoading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ data, isLoading }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard
        title="Nadadores Totales"
        value={data?.total_swimmers ?? '--'}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Competencias Registradas"
        value={data?.active_competitions ?? '--'}
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardHeader; 