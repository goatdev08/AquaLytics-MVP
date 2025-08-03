'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/MainLayout';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { createLogger } from '@/lib/utils/logger';

const VisualizationArea = dynamic(() => import('@/components/layout/VisualizationArea'), {
  ssr: false,
  loading: () => (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
        <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  ),
});

const QuickActions = dynamic(() => import('@/components/layout/QuickActions'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
  ),
});

interface AggregateData {
  total_swimmers?: number;
  active_competitions?: number;
  total_tests?: number;
}

export default function DashboardPage() {
  const logger = createLogger('DashboardPage');
  const [aggregateData, setAggregateData] = useState<AggregateData>({});
  const [isLoadingAggregate, setIsLoadingAggregate] = useState(true);

  useEffect(() => {
    const fetchAggregateData = async () => {
      setIsLoadingAggregate(true);
      try {
        const response = await fetch('/api/query/aggregate?metrics=total_swimmers,active_competitions,total_tests');
        
        if (!response.ok) {
          // Si la respuesta no es 2xx, no es JSON válido.
          const errorText = await response.text();
          logger.error(`Error from server: ${response.status} ${response.statusText}`, errorText);
          throw new Error('Server responded with an error');
        }

        const result = await response.json();
        if (result.success) {
          setAggregateData(result.data);
        } else {
          logger.error('Error fetching aggregate data:', result.error);
        }
      } catch (error) {
        // El error ya fue logueado, o es un error de red.
        logger.error('Failed to fetch aggregate data:', error);
      } finally {
        setIsLoadingAggregate(false);
      }
    };

    fetchAggregateData();
  }, []);

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        {/* Header del Dashboard */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Cards de métricas principales */}
        <div className="mb-8">
          <DashboardHeader data={aggregateData} isLoading={isLoadingAggregate} />
        </div>

        {/* Área principal con gráficos y acciones - Con espaciado mejorado */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Área de visualización (gráficos) */}
          <div className="xl:col-span-3">
            <VisualizationArea />
          </div>
          
          {/* Sidebar con acciones rápidas */}
          <div className="xl:col-span-1">
            <QuickActions />
          </div>
        </div>

      </div>
    </MainLayout>
  )
} 