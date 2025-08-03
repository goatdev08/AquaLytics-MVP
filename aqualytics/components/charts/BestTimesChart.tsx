'use client';

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card } from '@/components/ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Definir configuraciones disponibles
const STYLES = ['Libre', 'Mariposa', 'Dorso', 'Pecho'];
const DISTANCES = [50, 100, 200, 400];
const COURSES = ['Corto', 'Largo'];

interface BestTimeData {
  nadador: string;
  competencia: string;
  tiempo: number;
}

// Función para generar colores naranja Phoenix (diferentes tonalidades)
const generatePhoenixOrangeGradient = (index: number, total: number) => {
  // Base Phoenix orange colors: desde naranja claro hasta naranja oscuro/rojo
  const lightOrangeR = 255, lightOrangeG = 200, lightOrangeB = 87;  // #FFC857 (naranja claro)
  const darkOrangeR = 234, darkOrangeG = 88, darkOrangeB = 12;     // #EA580C (naranja oscuro)
  
  // Calcular interpolación
  const ratio = total > 1 ? index / (total - 1) : 0;
  const r = Math.round(lightOrangeR + (darkOrangeR - lightOrangeR) * ratio);
  const g = Math.round(lightOrangeG + (darkOrangeG - lightOrangeG) * ratio);
  const b = Math.round(lightOrangeB + (darkOrangeB - lightOrangeB) * ratio);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.8)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
    hoverBackgroundColor: `rgba(${r}, ${g}, ${b}, 0.95)`,
  };
};

const BestTimesChart: React.FC = () => {
  const [style, setStyle] = useState(STYLES[0]);
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [course, setCourse] = useState(COURSES[0]);
  const [data, setData] = useState<BestTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log(`🏊 Fetching best times: ${distance}m ${style} curso ${course}`);
      
      try {
        const response = await fetch(`/api/query/best-times?style=${style}&distance=${distance}&course=${course}`);
        const result = await response.json();
        
        console.log(`📊 API Response:`, result);
        
        if (result.success) {
          setData(result.data);
          console.log(`✅ Data loaded: ${result.data.length} records`);
        } else {
          setError(result.error || 'Error desconocido');
          setData([]);
        }
      } catch (error) {
        console.error("❌ Error fetching best times:", error);
        setError('Error de conexión con el servidor');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [style, distance, course]);

  // Configuración del gráfico optimizada
  const chartData = {
    labels: data.map((d, index) => `#${index + 1} ${d.nadador}`), // Agregar número de ranking
    datasets: [{
      label: 'Tiempo (segundos)',
      data: data.map(d => d.tiempo),
      backgroundColor: data.map((_, index) => generatePhoenixOrangeGradient(index, data.length).backgroundColor),
      borderColor: data.map((_, index) => generatePhoenixOrangeGradient(index, data.length).borderColor),
      hoverBackgroundColor: data.map((_, index) => generatePhoenixOrangeGradient(index, data.length).hoverBackgroundColor),
      borderWidth: 2,
      borderRadius: 16, // Bordes redondeados tipo píldora
      borderSkipped: false,
      categoryPercentage: 0.6, // Reducir grosor de barras a 2/3 (de 0.9 default a 0.6)
      barPercentage: 0.7, // Ajustar espaciado entre barras
    }]
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultar leyenda para ahorrar espacio
      },
      title: {
        display: true,
        text: `🏊 Mejores Tiempos: ${distance}m ${style} (${course})`,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        color: 'rgb(55, 65, 81)', // Compatible con tema claro
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            return `#${index + 1} ${data[index].nadador}`;
          },
          label: (context: any) => {
            const index = context.dataIndex;
            return [
              `Tiempo: ${context.parsed.x.toFixed(2)}s`,
              `Competencia: ${data[index].competencia}`,
              `Posición: #${index + 1}`,
            ];
          },
        },
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Fondo oscuro para buena legibilidad
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ea580c', // Phoenix orange border
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.3)', // Compatible con ambos temas
        },
        ticks: {
          callback: (value: any) => `${value}s`,
          color: 'rgb(107, 114, 128)', // Compatible con ambos temas
        },
        title: {
          display: true,
          text: 'Tiempo (segundos)',
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      y: {
        grid: {
          display: false, // Ocultar grid vertical para más limpieza
        },
        ticks: {
          color: 'rgb(55, 65, 81)', // Compatible con ambos temas
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="h-[320px] w-full bg-muted animate-pulse rounded-md" />;
    }

    if (error) {
      return (
        <div className="h-[320px] w-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-2">⚠️</div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="h-[320px] w-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <div className="text-center">
            <div className="text-6xl mb-4">🏊‍♂️</div>
            <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-300">No hay registros</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              No hay datos para {distance}m {style} curso {course}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
              Prueba con otra combinación de filtros
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-[320px]">
        <Bar options={chartOptions} data={chartData} />
      </div>
    );
  };

  // Componente de filtro mejorado
  const FilterButton = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 font-medium
        ${active 
          ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg transform scale-105' 
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-md'
        }`}
    >
      {children}
    </button>
  );

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">🏆</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Mejores Tiempos</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rankings de rendimiento</p>
            </div>
          </div>
          {data.length > 0 && (
            <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
              {data.length} registro{data.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        {/* Filtros optimizados */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
              🏊 Estilo:
            </span>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <FilterButton 
                  key={s} 
                  active={style === s} 
                  onClick={() => setStyle(s)}
                >
                  {s}
                </FilterButton>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
              📏 Distancia:
            </span>
            <div className="flex flex-wrap gap-2">
              {DISTANCES.map(d => (
                <FilterButton 
                  key={d} 
                  active={distance === d} 
                  onClick={() => setDistance(d)}
                >
                  {d}m
                </FilterButton>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
              🏊‍♀️ Curso:
            </span>
            <div className="flex flex-wrap gap-2">
              {COURSES.map(c => (
                <FilterButton 
                  key={c} 
                  active={course === c} 
                  onClick={() => setCourse(c)}
                >
                  {c}
                </FilterButton>
              ))}
            </div>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </Card>
  );
};

export default BestTimesChart; 