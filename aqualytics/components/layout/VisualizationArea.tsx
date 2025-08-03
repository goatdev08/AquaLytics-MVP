'use client';

import React from 'react';
import BestTimesChart from '@/components/charts/BestTimesChart';
import StylesDistributionChart from '@/components/charts/StylesDistributionChart';

const VisualizationArea: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de mejores tiempos (Top 5) */}
        <div className="lg:col-span-1">
          <BestTimesChart />
        </div>
        
        {/* Gráfico de distribución de estilos */}
        <div className="lg:col-span-1">
          <StylesDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default VisualizationArea; 