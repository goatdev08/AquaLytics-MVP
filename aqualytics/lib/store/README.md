# AquaLytics Stores Documentation

Este directorio contiene todos los stores de gestión de estado de la aplicación AquaLytics, implementados con [Zustand](https://github.com/pmndrs/zustand).

## 📁 Estructura de Stores

```
/lib/store/
├── swimmers-store.ts      # Gestión de nadadores
├── metrics-store.ts       # Gestión de métricas y cálculos
├── ui-store.ts           # Estados de interfaz de usuario
├── index.ts              # Exportaciones centralizadas
└── README.md             # Esta documentación
```

## 🏊 Swimmers Store

**Archivo**: `swimmers-store.ts`

### Funcionalidades principales

- **CRUD completo** de nadadores
- **Cache inteligente** con expiración automática
- **Filtros avanzados** por edad, peso, registros
- **Búsqueda en tiempo real**
- **Optimistic updates** para mejor UX
- **Paginación** automática

### Hooks disponibles

```typescript
// Store principal
useSwimmersStore()

// Operaciones CRUD
useSwimmerOperations() // create, update, delete, clearError

// Nadador seleccionado
useSelectedSwimmer() // swimmer, select, clear

// Lista y filtros
useSwimmersList() // swimmers, stats, fetch, search, filter
```

### Ejemplo de uso

```typescript
import { useSwimmerOperations, useSwimmersList } from '@/lib/store'

function SwimmerComponent() {
  const { swimmers, loading, fetchSwimmers } = useSwimmersList()
  const { createSwimmer, loading: creating } = useSwimmerOperations()
  
  // Obtener nadadores al montar
  useEffect(() => {
    fetchSwimmers()
  }, [])
  
  // Crear nuevo nadador
  const handleCreate = async (data) => {
    await createSwimmer(data)
  }
  
  return (
    // Tu componente aquí
  )
}
```

## 📊 Metrics Store

**Archivo**: `metrics-store.ts`

### Funcionalidades principales

- **Cálculos automáticos** de métricas derivadas
- **Validaciones** en tiempo real de datos
- **Análisis de rendimiento** y comparaciones
- **Rankings** por métricas específicas
- **Exportación** de datos en múltiples formatos
- **Cache de cálculos** para optimización

### Hooks disponibles

```typescript
// Store principal
useMetricsStore()

// Operaciones CRUD
useMetricsOperations() // create, update, delete, validate, calculate

// Análisis avanzado
useMetricsAnalysis() // performance, ranking, progress

// Datos y filtros
useMetricsData() // records, parameters, filter, stats
```

### Cálculos automáticos incluidos

- **V1, V2**: Velocidades por segmento (25m/tiempo)
- **V promedio**: Velocidad total (50m/tiempo_total)
- **DIST x BRZ**: Distancia por brazada (50m/brazadas_total)
- **DIST sin F**: Distancia sin flecha (50m - flechas)
- **F promedio**: Promedio de flechas ((F1 + F2) / 2)

### Ejemplo de uso

```typescript
import { useMetricsOperations, useMetricsData } from '@/lib/store'

function MetricsForm() {
  const { createRecord, validateMetrics, calculating } = useMetricsOperations()
  const { parametros } = useMetricsData()
  
  const handleSubmit = async (formData) => {
    // Validar datos primero
    const validation = validateMetrics(formData)
    if (!validation.valid) {
      console.error('Errores:', validation.errors)
      return
    }
    
    // Crear registro con cálculos automáticos
    const record = await createRecord(formData)
    console.log('Registro creado:', record)
  }
  
  return (
    // Tu formulario aquí
  )
}
```

## 🎨 UI Store

**Archivo**: `ui-store.ts`

### Funcionalidades principales

- **Gestión de modales** con contexto
- **Estados de carga** granulares
- **Sistema de notificaciones** con auto-expire
- **Navegación** y breadcrumbs
- **Preferencias de usuario** (tema, accesibilidad)
- **Estados de formularios** con validación

### Hooks disponibles

```typescript
// Store principal
useUIStore()

// Modales
useModals() // open, close, isOpen, modalData

// Loading states
useLoadingStates() // global, specific, progress

// Navegación
useNavigation() // sidebar, tabs, breadcrumbs, view

// Notificaciones
useNotifications() // add, remove, mark as read

// Preferencias
useUIPreferences() // theme, accessibility, density

// Formularios
useFormStates() // dirty, errors, validation
```

### Ejemplo de uso

```typescript
import { useModals, useNotifications, useLoadingStates } from '@/lib/store'

function MyComponent() {
  const { openModal, closeModal } = useModals()
  const { addNotification } = useNotifications()
  const { setGlobalLoading } = useLoadingStates()
  
  const handleAction = async () => {
    setGlobalLoading(true, 'Procesando...')
    
    try {
      // Tu lógica aquí
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Operación completada'
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message
      })
    } finally {
      setGlobalLoading(false)
    }
  }
  
  return (
    <button onClick={() => openModal('createSwimmerModal', { mode: 'create' })}>
      Crear Nadador
    </button>
  )
}
```

## 🔧 Configuración y Persistencia

### Cache y Expiración

```typescript
CACHE_EXPIRY: {
  SWIMMERS: 5 * 60 * 1000, // 5 minutos
  METRICS: 3 * 60 * 1000,  // 3 minutos
  UI: 24 * 60 * 60 * 1000, // 24 horas
}
```

### Storage

```typescript
STORAGE: {
  SWIMMERS: 'sessionStorage', // Datos de sesión
  METRICS: 'sessionStorage',  // Datos de sesión
  UI: 'localStorage',         // Preferencias persistentes
}
```

### DevTools

- Habilitado automáticamente en **desarrollo**
- Logging de cambios de estado
- Nombres descriptivos para debugging

## 🚀 Mejores Prácticas

### 1. **Importaciones**

```typescript
// ✅ Usar el index para importaciones limpias
import { useSwimmersList, useMetricsOperations } from '@/lib/store'

// ❌ Evitar importaciones directas de archivos
import { useSwimmersStore } from '@/lib/store/swimmers-store'
```

### 2. **Manejo de errores**

```typescript
const { createSwimmer, error, clearError } = useSwimmerOperations()

// Limpiar errores al montar componente
useEffect(() => {
  clearError()
}, [clearError])

// Mostrar errores en UI
if (error) {
  return <div className="error">{error}</div>
}
```

### 3. **Optimistic Updates**

```typescript
// Los stores manejan automáticamente optimistic updates
// Solo maneja los errores para rollback
const handleUpdate = async (id, data) => {
  try {
    await updateSwimmer(id, data) // Actualiza optimísticamente
  } catch (error) {
    // El store hace rollback automáticamente
    console.error('Error:', error)
  }
}
```

### 4. **Cache**

```typescript
// Verificar cache antes de hacer fetch
if (!isCacheValid()) {
  await fetchSwimmers()
}

// O forzar recarga
await fetchSwimmers({ force: true })
```

## 🐛 Debug y Desarrollo

### Logging en desarrollo

Los stores automáticamente logean cambios de estado en la consola durante desarrollo.

### Debug hooks (solo desarrollo)

```typescript
import { useStoreDebug } from '@/lib/store'

function DebugComponent() {
  const { logState, exportState } = useStoreDebug()
  
  return (
    <div>
      <button onClick={logState}>Log State</button>
      <button onClick={exportState}>Export State</button>
    </div>
  )
}
```

## 📝 Notas importantes

1. **Persistencia**: Solo se persisten datos críticos, no estados temporales
2. **Tipos**: Todos los stores están completamente tipados con TypeScript
3. **Performance**: Cache automático evita requests innecesarios
4. **UX**: Optimistic updates mejoran la percepción de velocidad
5. **Debugging**: DevTools disponibles solo en desarrollo

## 🔗 Links útiles

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand/wiki/Recipes)
- [TypeScript with Zustand](https://github.com/pmndrs/zustand#typescript)
