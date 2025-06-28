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
} from 'chart.js'

// Registrar componentes necesarios de Chart.js solo en el cliente
if (typeof window !== 'undefined') {
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
    Filler
  )
}

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
export const baseChartOptions = {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: function(context: any) {
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
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.08)',
        lineWidth: 1,
      },
      angleLines: {
        color: 'rgba(0, 0, 0, 0.1)',
        lineWidth: 1,
      },
      pointLabels: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
          weight: 'normal' as const,
        },
        color: '#374151',
        padding: 15,
      },
      ticks: {
        stepSize: 20,
        showLabelBackdrop: false,
        color: '#9CA3AF',
        font: {
          size: 9,
        },
      },
    },
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.1,
    },
    point: {
      radius: 3,
      hoverRadius: 5,
      borderWidth: 2,
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

// Función helper para crear gradientes (solo en cliente)
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  opacity: number = 0.2
) => {
  if (typeof window === 'undefined') return color
  
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16)}`)
  gradient.addColorStop(1, `${color}00`)
  return gradient
}

// Función para aplicar tema oscuro a las opciones
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyDarkMode = (options: any): any => {
  const darkOptions = JSON.parse(JSON.stringify(options))
  
  // Actualizar colores para modo oscuro
  if (darkOptions.plugins?.legend?.labels) {
    darkOptions.plugins.legend.labels.color = phoenixColors.textDark
  }
  
  if (darkOptions.scales) {
    Object.values(darkOptions.scales).forEach((scale: unknown) => {
      const scaleOptions = scale as {
        ticks?: { color?: string }
        grid?: { color?: string }
        pointLabels?: { color?: string }
      }
      
      if (scaleOptions.ticks) {
        scaleOptions.ticks.color = phoenixColors.textDark
      }
      if (scaleOptions.grid) {
        scaleOptions.grid.color = 'rgba(255, 255, 255, 0.1)'
      }
      if (scaleOptions.pointLabels) {
        scaleOptions.pointLabels.color = phoenixColors.textDark
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
  applyDarkMode,
} 