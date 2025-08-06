'use client';

import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card } from '@/components/ui/Card';

ChartJS.register(ArcElement, Tooltip, Legend);

interface StyleData {
  estilo: string;
  total_registros_completos: number;
  nadadores_distintos: number;
}

const StylesDistributionChart: React.FC = () => {
  const [data, setData] = useState<StyleData[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalNadadores, setTotalNadadores] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Usar el nuevo endpoint para registros completos
        const response = await fetch('/api/registros-completos?includeSwimmerCount=true');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setData(result.data);
          setTotalRegistros(result.total_registros_completos || 0);
          setTotalNadadores(result.total_nadadores_unicos || 0); // Usar el conteo correcto
        } else {
          setError(result.error || 'No se pudieron obtener los datos');
        }
      } catch (err) {
        console.error('Error fetching styles distribution:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generar colores para los 5 estilos de natación
  const generateProfessionalColors = (count: number) => {
    // Paleta de colores profesionales para los 5 estilos
    const professionalColors = [
      {
        background: '#3B82F6', // blue-500 - Libre
        border: '#1D4ED8',     // blue-700
        hover: '#60A5FA'       // blue-400
      },
      {
        background: '#EF4444', // red-500 - Mariposa
        border: '#B91C1C',     // red-700
        hover: '#F87171'       // red-400
      },
      {
        background: '#10B981', // green-500 - Pecho
        border: '#047857',     // green-700
        hover: '#34D399'       // green-400
      },
      {
        background: '#F59E0B', // amber-500 - Dorso
        border: '#D97706',     // amber-600
        hover: '#FCD34D'       // amber-300
      },
      {
        background: '#8B5CF6', // violet-500 - Combinado
        border: '#6D28D9',     // violet-700
        hover: '#A78BFA'       // violet-400
      }
    ];
    
    const colors = {
      background: [] as string[],
      border: [] as string[],
      hover: [] as string[]
    };
    
    for (let i = 0; i < count; i++) {
      const colorSet = professionalColors[i % professionalColors.length];
      colors.background.push(colorSet.background);
      colors.border.push(colorSet.border);
      colors.hover.push(colorSet.hover);
    }
    
    return colors;
  };

  const colors = generateProfessionalColors(data.length);

  const chartData = {
    labels: data.map(item => item.estilo),
    datasets: [
      {
        data: data.map(item => item.total_registros_completos),
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: colors.hover,
        hoverBorderColor: colors.border,
        // Agregar espaciado entre segmentos
        spacing: 3,
      },
    ],
  };

  // Función para obtener colores del tema actual
  const getThemeColors = () => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      return {
        foreground: `hsl(${style.getPropertyValue('--foreground')})`,
        mutedForeground: `hsl(${style.getPropertyValue('--muted-foreground')})`,
        border: `hsl(${style.getPropertyValue('--border')})`
      };
    }
    return {
      foreground: 'rgb(23, 23, 23)', // fallback para light theme
      mutedForeground: 'rgb(100, 116, 139)',
      border: 'rgba(156, 163, 175, 0.3)'
    };
  };

  const themeColors = getThemeColors();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 25,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 14,
            weight: 'normal' as const,
          },
          color: themeColors.mutedForeground,
          boxWidth: 14,
          boxHeight: 14,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ea580c', // Phoenix orange border
        borderWidth: 1,
        cornerRadius: 10,
        titleFont: {
          size: 15,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 14,
        },
        padding: 16,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = data.reduce((sum, item) => sum + item.total_registros_completos, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            const styleData = data[context.dataIndex];
            
            return [
              `${context.label}: ${value} registros`,
              `Porcentaje: ${percentage}%`,
              `Nadadores en este estilo: ${styleData?.nadadores_distintos || 0}`
            ];
          },
        },
      },
    },
    // Configuración para donut chart más grande y profesional
    cutout: '60%', // Aumentar cutout para que el donut sea más delgado y se vea más grande
    // Animaciones suaves
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
    // Efectos hover suaves
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (error) {
    return (
      <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Distribución de Estilos
          </h3>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:shadow-blue-100/20 dark:hover:shadow-blue-900/20 flex flex-col h-full">
      {/* Header profesional con gradiente sutil */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-sm">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Distribución de Estilos
          </h3>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-gradient-to-r from-phoenix-orange/10 to-phoenix-red/10 border border-phoenix-orange/20 text-phoenix-orange dark:text-phoenix-orange-light text-sm font-semibold rounded-full shadow-sm">
            {totalRegistros} registros
          </span>
        </div>
      </div>

      {/* Contenedor principal del contenido */}
      <div className="flex-1 flex flex-col mt-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : data.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="text-8xl mb-6 opacity-60">📊</div>
            <p className="text-muted-foreground text-center font-medium text-lg">
              No hay datos disponibles
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Gráfico ocupando todo el espacio disponible */}
            <div className="flex-grow min-h-0">
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            {/* Estadísticas (opcional si se quieren mantener) */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border mt-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {data.length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Estilos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {totalRegistros}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Registros</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM5 8a2 2 0 11-4 0 2 2 0 014 0zM17 8a2 2 0 11-4 0 2 2 0 014 0zM9 14a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 005.546.916A5 5 0 0015 14H9z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {totalNadadores}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Nadadores</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StylesDistributionChart; 