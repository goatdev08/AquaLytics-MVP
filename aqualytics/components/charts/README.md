# AquaLytics Chart Components

Este directorio contiene los componentes de visualización de datos para el sistema AquaLytics. Todos los componentes están construidos con Chart.js y react-chartjs-2, siguiendo el tema Phoenix y soportando modo oscuro.

## 📦 Componentes Disponibles

### 1. MetricsChart
Gráfico de líneas para visualizar la progresión de una métrica específica a lo largo del tiempo.

**Props:**
- `title: string` - Título del gráfico
- `data: MetricDataPoint[]` - Array de puntos de datos con fecha y valor
- `metricName: string` - Nombre de la métrica
- `metricType?: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'vLim' | 'sr' | 'si'` - Tipo de métrica (determina el color)
- `unit?: string` - Unidad de medida (ej: "m/s", "brazadas/min")
- `height?: number` - Altura del gráfico en píxeles (default: 300)
- `showStats?: boolean` - Mostrar estadísticas (min, max, promedio, tendencia)
- `isDarkMode?: boolean` - Aplicar tema oscuro

**Ejemplo:**
```tsx
<MetricsChart
  title="Velocidad Promedio"
  data={[
    { fecha: '2024-01-15', valor: 1.85 },
    { fecha: '2024-01-22', valor: 1.87 }
  ]}
  metricName="v1"
  metricType="v1"
  unit="m/s"
  showStats={true}
/>
```

### 2. ProgressChart
Gráfico multi-línea para comparar el progreso de múltiples nadadores en una métrica.

**Props:**
- `title: string` - Título del gráfico
- `swimmerData: SwimmerProgress[]` - Array de datos por nadador
- `metricName: string` - Nombre de la métrica a visualizar
- `unit?: string` - Unidad de medida
- `height?: number` - Altura del gráfico (default: 400)
- `colorScheme?: 'warm' | 'gradient' | 'monochrome'` - Esquema de colores
- `showComparison?: boolean` - Mostrar tabla comparativa
- `isDarkMode?: boolean` - Aplicar tema oscuro

**Ejemplo:**
```tsx
<ProgressChart
  title="Comparación de Velocidad"
  swimmerData={[
    {
      nombre: "Ana García",
      data: [
        { fecha: '2024-01-15', valor: 1.85 },
        { fecha: '2024-01-22', valor: 1.87 }
      ]
    },
    {
      nombre: "Carlos López",
      data: [
        { fecha: '2024-01-15', valor: 1.82 },
        { fecha: '2024-01-22', valor: 1.84 }
      ]
    }
  ]}
  metricName="Velocidad Promedio"
  unit="m/s"
  showComparison={true}
/>
```

### 3. ComparisonChart
Gráfico de radar para comparar múltiples métricas entre nadadores.

**Props:**
- `title: string` - Título del gráfico
- `swimmers: SwimmerComparison[]` - Array de nadadores con sus métricas
- `colorScheme?: 'warm' | 'gradient' | 'monochrome'` - Esquema de colores
- `showLegend?: boolean` - Mostrar leyenda (default: true)
- `height?: number` - Altura del gráfico (default: 400)
- `isDarkMode?: boolean` - Aplicar tema oscuro

**Ejemplo:**
```tsx
<ComparisonChart
  title="Comparación Multi-Métrica"
  swimmers={[
    {
      nombre: "Ana García",
      metrics: [
        { metric: 'v1', value: 1.85, displayName: 'Velocidad', unit: 'm/s' },
        { metric: 'sr', value: 45, displayName: 'Frecuencia', unit: 'brazadas/min' },
        { metric: 'si', value: 2.1, displayName: 'Índice', unit: 'puntos' }
      ]
    },
    {
      nombre: "Carlos López",
      metrics: [
        { metric: 'v1', value: 1.82, displayName: 'Velocidad', unit: 'm/s' },
        { metric: 'sr', value: 42, displayName: 'Frecuencia', unit: 'brazadas/min' },
        { metric: 'si', value: 1.9, displayName: 'Índice', unit: 'puntos' }
      ]
    }
  ]}
/>
```

### 4. RankingTable
Tabla interactiva para mostrar rankings de nadadores con filtros y ordenamiento.

**Props:**
- `title: string` - Título de la tabla
- `swimmers: SwimmerRanking[]` - Array de nadadores con sus puntuaciones
- `primaryMetric?: string` - Métrica principal a resaltar
- `showOverallScore?: boolean` - Mostrar puntuación general (default: true)
- `showFilters?: boolean` - Mostrar filtros de búsqueda (default: true)
- `highlightTop?: number` - Número de posiciones a resaltar (default: 3)

**Ejemplo:**
```tsx
<RankingTable
  title="Ranking General"
  swimmers={[
    {
      id: '1',
      nombre: 'Ana García',
      prueba: '100m Libre',
      scores: [
        { metric: 'v1', value: 1.85, displayName: 'Velocidad', unit: 'm/s' },
        { metric: 'tiempo', value: 54.32, displayName: 'Tiempo', unit: 's' }
      ]
    }
  ]}
  primaryMetric="tiempo"
/>
```

## 🎨 Configuración de Temas

### Colores del Tema Phoenix
Los componentes utilizan el sistema de colores Phoenix definido en `lib/utils/chart-configs.ts`:

```typescript
const phoenixColors = {
  red: '#ef4444',      // v1
  orange: '#f97316',   // v2
  yellow: '#eab308',   // v3
  amber: '#f59e0b',    // v4
  lime: '#84cc16',     // v5
  green: '#22c55e',    // vLim
  teal: '#14b8a6',     // sr
  cyan: '#06b6d4',     // si
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899'
}
```

### Esquemas de Color
- **warm**: Colores cálidos (rojo, naranja, amarillo)
- **gradient**: Gradiente completo del tema
- **monochrome**: Variaciones de azul

### Modo Oscuro
Todos los componentes aceptan la prop `isDarkMode` que ajusta automáticamente:
- Colores de texto y fondo
- Líneas de cuadrícula
- Bordes y sombras

## 📊 Funcionalidades Comunes

### Exportación
- **MetricsChart, ProgressChart, ComparisonChart**: Exportan a PNG
- **RankingTable**: Exporta a CSV

### Responsividad
Todos los componentes son responsivos y se adaptan al contenedor padre.

### Tooltips Informativos
Los gráficos muestran información detallada al pasar el cursor sobre los puntos de datos.

### Animaciones
Transiciones suaves al cargar y actualizar datos.

## 🛠️ Configuración Base

Las configuraciones base para Chart.js están en `lib/utils/chart-configs.ts`:

```typescript
// Configuración para gráficos de línea
export const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 750 },
  // ... más opciones
}

// Configuración para gráficos de radar
export const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // ... más opciones
}
```

## 📝 Notas de Implementación

1. **Normalización de Datos**: ComparisonChart normaliza automáticamente los valores a porcentajes (0-100%) para facilitar la comparación visual entre métricas con diferentes escalas.

2. **Manejo de Fechas**: Los componentes esperan fechas en formato ISO (YYYY-MM-DD) y las formatean automáticamente para visualización.

3. **Rendimiento**: Se utilizan `useMemo` para optimizar cálculos pesados y evitar re-renderizados innecesarios.

4. **Accesibilidad**: Los componentes incluyen etiquetas ARIA apropiadas y son navegables por teclado.

## 🚀 Próximas Mejoras

- [ ] Soporte para más tipos de gráficos (barras, dispersión)
- [ ] Filtros de fecha en MetricsChart y ProgressChart
- [ ] Modo de comparación lado a lado
- [ ] Integración con datos en tiempo real
- [ ] Exportación a más formatos (PDF, Excel) 