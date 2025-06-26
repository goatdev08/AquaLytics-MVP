/**
 * Chart.js Configuration with Phoenix Theme
 * Configuraciones reutilizables para todos los gráficos con tema Phoenix
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  TooltipItem,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
)

// Phoenix Theme Colors
export const phoenixColors = {
  // Core Colors
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#D97706',
  amber: '#F59E0B',
  rose: '#E11D48',
  crimson: '#B91C1C',
  coral: '#F97316',
  gold: '#EAB308',
  
  // Variations
  redLight: '#FCA5A5',
  redDark: '#991B1B',
  orangeLight: '#FDBA74',
  orangeDark: '#C2410C',
  yellowLight: '#FDE68A',
  yellowDark: '#92400E',
  
  // Accent Colors
  flame: '#FF4500',
  sunset: '#FF6B35',
  dawn: '#FFD60A',
  warmGray: '#78716C',
  ash: '#6B7280',
  
  // Functional Colors
  background: 'rgba(255, 255, 255, 0.95)',
  backgroundDark: 'rgba(17, 24, 39, 0.95)',
  text: '#1F2937',
  textDark: '#F3F4F6',
  border: '#E5E7EB',
  borderDark: '#374151',
}

// Dataset color schemes para múltiples líneas/barras
export const datasetColorSchemes = {
  warm: [
    phoenixColors.red,
    phoenixColors.orange,
    phoenixColors.yellow,
    phoenixColors.amber,
    phoenixColors.coral,
    phoenixColors.gold,
  ],
  gradient: [
    phoenixColors.crimson,
    phoenixColors.red,
    phoenixColors.orange,
    phoenixColors.coral,
    phoenixColors.sunset,
    phoenixColors.flame,
  ],
  monochrome: [
    phoenixColors.redDark,
    phoenixColors.red,
    phoenixColors.redLight,
    `${phoenixColors.red}99`,
    `${phoenixColors.red}66`,
    `${phoenixColors.red}33`,
  ],
}

// Configuración base compartida para todos los gráficos
export const baseChartOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    tooltip: {
      backgroundColor: phoenixColors.backgroundDark,
      titleColor: phoenixColors.textDark,
      bodyColor: phoenixColors.textDark,
      borderColor: phoenixColors.borderDark,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: true,
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label: function(context: TooltipItem<any>) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('es-ES', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            }).format(context.parsed.y);
          }
          return label;
        }
      }
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
}

// Configuración específica para gráficos de línea
export const lineChartOptions: ChartOptions<'line'> = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 3,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: phoenixColors.background,
      borderWidth: 2,
    },
  },
}

// Configuración específica para gráficos de radar
export const radarChartOptions: ChartOptions<'radar'> = {
  ...baseChartOptions,
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      pointLabels: {
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
      ticks: {
        stepSize: 0.5,
        font: {
          size: 10,
        },
      },
    },
  },
  elements: {
    line: {
      borderWidth: 3,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
}

// Configuración específica para gráficos de barras
export const barChartOptions: ChartOptions<'bar'> = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 4,
      borderSkipped: false,
    },
  },
}

// Función helper para crear gradientes
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  opacity: number = 0.2
) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16)}`)
  gradient.addColorStop(1, `${color}00`)
  return gradient
}

// Configuración para zoom (opcional)
export const zoomOptions = {
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: 'x' as const,
  },
  pan: {
    enabled: true,
    mode: 'x' as const,
  },
  limits: {
    x: { min: 'original' as const, max: 'original' as const },
  },
}

// Función para aplicar tema oscuro a las opciones
export const applyDarkMode = (options: ChartOptions<any>): ChartOptions<any> => {
  const darkOptions = JSON.parse(JSON.stringify(options))
  
  // Actualizar colores para modo oscuro
  if (darkOptions.plugins?.legend?.labels) {
    darkOptions.plugins.legend.labels.color = phoenixColors.textDark
  }
  
  if (darkOptions.scales) {
    Object.values(darkOptions.scales).forEach((scale: any) => {
      if (scale.ticks) {
        scale.ticks.color = phoenixColors.textDark
      }
      if (scale.grid) {
        scale.grid.color = 'rgba(255, 255, 255, 0.1)'
      }
      if (scale.pointLabels) {
        scale.pointLabels.color = phoenixColors.textDark
      }
    })
  }
  
  return darkOptions
}

// Exportar configuraciones predefinidas para uso rápido
export const chartConfigs = {
  phoenixColors,
  datasetColorSchemes,
  baseChartOptions,
  lineChartOptions,
  radarChartOptions,
  barChartOptions,
  createGradient,
  zoomOptions,
  applyDarkMode,
} 