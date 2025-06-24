/**
 * UI Store - Zustand State Management
 * Gestión centralizada de estados de interfaz de usuario
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// ===== TIPOS DEL STORE =====

interface ModalStates {
  // Modales principales
  createSwimmerModal: boolean
  editSwimmerModal: boolean
  deleteSwimmerModal: boolean
  
  // Modales de métricas
  createMetricModal: boolean
  editMetricModal: boolean
  deleteMetricModal: boolean
  
  // Modales de análisis
  performanceAnalysisModal: boolean
  comparisonModal: boolean
  exportDataModal: boolean
  
  // Modales de configuración
  settingsModal: boolean
  helpModal: boolean
  
  // Estado del modal activo
  activeModal: string | null
  modalData: unknown // Datos del contexto del modal
}

interface LoadingStates {
  // Loading globales
  globalLoading: boolean
  pageLoading: boolean
  
  // Loading específicos
  swimmersLoading: boolean
  metricsLoading: boolean
  calculationsLoading: boolean
  
  // Loading de operaciones
  savingData: boolean
  deletingData: boolean
  exportingData: boolean
  
  // Mensajes de loading
  loadingMessage: string | null
  
  // Progress bars
  uploadProgress: number
  calculationProgress: number
}

interface NavigationStates {
  // Sidebar
  sidebarCollapsed: boolean
  sidebarHovered: boolean
  
  // Breadcrumbs
  currentPath: string[]
  
  // Tabs activos
  activeTab: string
  
  // Filtros expandidos
  filtersExpanded: boolean
  
  // Vista actual
  currentView: 'list' | 'cards' | 'table'
}

interface NotificationStates {
  // Notificaciones activas
  notifications: Notification[]
  
  // Contadores
  unreadCount: number
  
  // Configuración
  notificationsEnabled: boolean
  soundEnabled: boolean
}

interface ThemeStates {
  // No duplicamos el tema del ThemeContext
  // Solo estados UI relacionados con el tema
  
  // Preferencias de visualización
  compactMode: boolean
  highContrast: boolean
  reduceMotion: boolean
  
  // Tamaños de fuente
  fontSize: 'small' | 'medium' | 'large'
  
  // Densidad de datos
  dataDensity: 'comfortable' | 'compact' | 'spacious'
}

interface FormStates {
  // Estados de formularios activos
  activeForm: string | null
  formDirty: boolean
  formErrors: Record<string, string[]>
  
  // Validaciones en tiempo real
  realtimeValidation: boolean
  
  // Autoguardado
  autoSave: boolean
  lastSaved: number | null
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
  persistent?: boolean
  action?: {
    label: string
    handler: () => void
  }
}

interface UIStore extends 
  ModalStates, 
  LoadingStates, 
  NavigationStates, 
  NotificationStates, 
  ThemeStates, 
  FormStates {
  
  // ===== GESTIÓN DE MODALES =====
  
  // Abrir modal específico
  openModal: (modalName: keyof ModalStates, data?: unknown) => void
  
  // Cerrar modal específico
  closeModal: (modalName: keyof ModalStates) => void
  
  // Cerrar todos los modales
  closeAllModals: () => void
  
  // Verificar si un modal está abierto
  isModalOpen: (modalName: keyof ModalStates) => boolean
  
  // ===== GESTIÓN DE LOADING =====
  
  // Set loading global
  setGlobalLoading: (loading: boolean, message?: string) => void
  
  // Set loading específico
  setLoading: (type: keyof LoadingStates, loading: boolean) => void
  
  // Actualizar progreso
  updateProgress: (type: 'upload' | 'calculation', progress: number) => void
  
  // Limpiar todos los loadings
  clearLoadings: () => void
  
  // ===== GESTIÓN DE NAVEGACIÓN =====
  
  // Toggle sidebar
  toggleSidebar: () => void
  
  // Set sidebar hover
  setSidebarHover: (hovered: boolean) => void
  
  // Actualizar breadcrumbs
  updateBreadcrumbs: (path: string[]) => void
  
  // Cambiar tab activo
  setActiveTab: (tab: string) => void
  
  // Toggle filtros
  toggleFilters: () => void
  
  // Cambiar vista
  setView: (view: 'list' | 'cards' | 'table') => void
  
  // ===== GESTIÓN DE NOTIFICACIONES =====
  
  // Agregar notificación
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  
  // Marcar como leída
  markAsRead: (id: string) => void
  
  // Marcar todas como leídas
  markAllAsRead: () => void
  
  // Eliminar notificación
  removeNotification: (id: string) => void
  
  // Limpiar todas las notificaciones
  clearNotifications: () => void
  
  // Toggle configuraciones de notificaciones
  toggleNotifications: () => void
  toggleSound: () => void
  
  // ===== GESTIÓN DE PREFERENCIAS DE UI =====
  
  // Toggle configuraciones de accesibilidad
  toggleCompactMode: () => void
  toggleHighContrast: () => void
  toggleReduceMotion: () => void
  
  // Cambiar tamaño de fuente
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  
  // Cambiar densidad de datos
  setDataDensity: (density: 'comfortable' | 'compact' | 'spacious') => void
  
  // ===== GESTIÓN DE FORMULARIOS =====
  
  // Set formulario activo
  setActiveForm: (formName: string | null) => void
  
  // Marcar formulario como dirty
  setFormDirty: (dirty: boolean) => void
  
  // Agregar/limpiar errores de formulario
  setFormErrors: (field: string, errors: string[]) => void
  clearFormErrors: (field?: string) => void
  
  // Toggle validación en tiempo real
  toggleRealtimeValidation: () => void
  
  // Toggle autoguardado
  toggleAutoSave: () => void
  
  // Actualizar timestamp de guardado
  updateLastSaved: () => void
  
  // ===== UTILIDADES =====
  
  // Obtener estadísticas de UI
  getUIStats: () => {
    openModals: number
    activeLoadings: number
    unreadNotifications: number
    formsInProgress: number
  }
  
  // Reset completo
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState: Pick<
  UIStore,
  keyof ModalStates | keyof LoadingStates | keyof NavigationStates | 
  keyof NotificationStates | keyof ThemeStates | keyof FormStates
> = {
  // Modales
  createSwimmerModal: false,
  editSwimmerModal: false,
  deleteSwimmerModal: false,
  createMetricModal: false,
  editMetricModal: false,
  deleteMetricModal: false,
  performanceAnalysisModal: false,
  comparisonModal: false,
  exportDataModal: false,
  settingsModal: false,
  helpModal: false,
  activeModal: null,
  modalData: null,
  
  // Loading
  globalLoading: false,
  pageLoading: false,
  swimmersLoading: false,
  metricsLoading: false,
  calculationsLoading: false,
  savingData: false,
  deletingData: false,
  exportingData: false,
  loadingMessage: null,
  uploadProgress: 0,
  calculationProgress: 0,
  
  // Navegación
  sidebarCollapsed: false,
  sidebarHovered: false,
  currentPath: [],
  activeTab: 'dashboard',
  filtersExpanded: false,
  currentView: 'table',
  
  // Notificaciones
  notifications: [],
  unreadCount: 0,
  notificationsEnabled: true,
  soundEnabled: true,
  
  // Tema y accesibilidad
  compactMode: false,
  highContrast: false,
  reduceMotion: false,
  fontSize: 'medium',
  dataDensity: 'comfortable',
  
  // Formularios
  activeForm: null,
  formDirty: false,
  formErrors: {},
  realtimeValidation: true,
  autoSave: true,
  lastSaved: null,
}

// ===== FUNCIONES AUXILIARES =====

const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ===== STORE PRINCIPAL =====

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ===== MODALES =====
      
      openModal: (modalName: keyof ModalStates, data?: unknown) => {
        set(state => ({
          ...state,
          [modalName]: true,
          activeModal: modalName as string,
          modalData: data || null,
        }))
      },
      
      closeModal: (modalName: keyof ModalStates) => {
        set(state => ({
          ...state,
          [modalName]: false,
          activeModal: state.activeModal === modalName ? null : state.activeModal,
          modalData: state.activeModal === modalName ? null : state.modalData,
        }))
      },
      
      closeAllModals: () => {
        set(state => ({
          ...state,
          createSwimmerModal: false,
          editSwimmerModal: false,
          deleteSwimmerModal: false,
          createMetricModal: false,
          editMetricModal: false,
          deleteMetricModal: false,
          performanceAnalysisModal: false,
          comparisonModal: false,
          exportDataModal: false,
          settingsModal: false,
          helpModal: false,
          activeModal: null,
          modalData: null,
        }))
      },
      
      isModalOpen: (modalName: keyof ModalStates) => {
        return Boolean(get()[modalName])
      },
      
      // ===== LOADING =====
      
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({
          globalLoading: loading,
          loadingMessage: loading ? message || null : null,
        })
      },
      
      setLoading: (type: keyof LoadingStates, loading: boolean) => {
        set(state => ({
          ...state,
          [type]: loading,
        }))
      },
      
      updateProgress: (type: 'upload' | 'calculation', progress: number) => {
        const clampedProgress = Math.max(0, Math.min(100, progress))
        set(state => ({
          ...state,
          [`${type}Progress`]: clampedProgress,
        }))
      },
      
      clearLoadings: () => {
        set({
          globalLoading: false,
          pageLoading: false,
          swimmersLoading: false,
          metricsLoading: false,
          calculationsLoading: false,
          savingData: false,
          deletingData: false,
          exportingData: false,
          loadingMessage: null,
          uploadProgress: 0,
          calculationProgress: 0,
        })
      },
      
      // ===== NAVEGACIÓN =====
      
      toggleSidebar: () => {
        set(state => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }))
      },
      
      setSidebarHover: (hovered: boolean) => {
        set({ sidebarHovered: hovered })
      },
      
      updateBreadcrumbs: (path: string[]) => {
        set({ currentPath: path })
      },
      
      setActiveTab: (tab: string) => {
        set({ activeTab: tab })
      },
      
      toggleFilters: () => {
        set(state => ({
          filtersExpanded: !state.filtersExpanded,
        }))
      },
      
      setView: (view: 'list' | 'cards' | 'table') => {
        set({ currentView: view })
      },
      
      // ===== NOTIFICACIONES =====
      
      addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
          ...notification,
          id: generateNotificationId(),
          timestamp: Date.now(),
          read: false,
        }
        
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
        
        // Auto-remove non-persistent notifications after 5 seconds
        if (!notification.persistent) {
          setTimeout(() => {
            get().removeNotification(newNotification.id)
          }, 5000)
        }
      },
      
      markAsRead: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id)
          if (!notification || notification.read) return state
          
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }
        })
      },
      
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },
      
      removeNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id)
          const wasUnread = notification && !notification.read
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: wasUnread 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        })
      },
      
      clearNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        })
      },
      
      toggleNotifications: () => {
        set(state => ({
          notificationsEnabled: !state.notificationsEnabled,
        }))
      },
      
      toggleSound: () => {
        set(state => ({
          soundEnabled: !state.soundEnabled,
        }))
      },
      
      // ===== PREFERENCIAS UI =====
      
      toggleCompactMode: () => {
        set(state => ({
          compactMode: !state.compactMode,
        }))
      },
      
      toggleHighContrast: () => {
        set(state => ({
          highContrast: !state.highContrast,
        }))
      },
      
      toggleReduceMotion: () => {
        set(state => ({
          reduceMotion: !state.reduceMotion,
        }))
      },
      
      setFontSize: (size: 'small' | 'medium' | 'large') => {
        set({ fontSize: size })
      },
      
      setDataDensity: (density: 'comfortable' | 'compact' | 'spacious') => {
        set({ dataDensity: density })
      },
      
      // ===== FORMULARIOS =====
      
      setActiveForm: (formName: string | null) => {
        set({ activeForm: formName })
      },
      
      setFormDirty: (dirty: boolean) => {
        set({ formDirty: dirty })
      },
      
      setFormErrors: (field: string, errors: string[]) => {
        set(state => ({
          formErrors: {
            ...state.formErrors,
            [field]: errors,
          },
        }))
      },
      
      clearFormErrors: (field?: string) => {
        if (field) {
          set(state => {
            const newErrors = { ...state.formErrors }
            delete newErrors[field]
            return { formErrors: newErrors }
          })
        } else {
          set({ formErrors: {} })
        }
      },
      
      toggleRealtimeValidation: () => {
        set(state => ({
          realtimeValidation: !state.realtimeValidation,
        }))
      },
      
      toggleAutoSave: () => {
        set(state => ({
          autoSave: !state.autoSave,
        }))
      },
      
      updateLastSaved: () => {
        set({ lastSaved: Date.now() })
      },
      
      // ===== UTILIDADES =====
      
      getUIStats: () => {
        const state = get()
        
        // Contar modales abiertos
        const modalKeys: (keyof ModalStates)[] = [
          'createSwimmerModal', 'editSwimmerModal', 'deleteSwimmerModal',
          'createMetricModal', 'editMetricModal', 'deleteMetricModal',
          'performanceAnalysisModal', 'comparisonModal', 'exportDataModal',
          'settingsModal', 'helpModal'
        ]
        const openModals = modalKeys.filter(key => state[key]).length
        
        // Contar loadings activos
        const loadingKeys: (keyof LoadingStates)[] = [
          'globalLoading', 'pageLoading', 'swimmersLoading', 'metricsLoading',
          'calculationsLoading', 'savingData', 'deletingData', 'exportingData'
        ]
        const activeLoadings = loadingKeys.filter(key => state[key]).length
        
        // Formularios en progreso
        const formsInProgress = state.activeForm ? 1 : 0
        
        return {
          openModals,
          activeLoadings,
          unreadNotifications: state.unreadCount,
          formsInProgress,
        }
      },
      
      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'aqualytics-ui-store',
      storage: createJSONStorage(() => localStorage), // UI persiste en localStorage
      partialize: (state) => ({
        // Persistir solo preferencias del usuario, no estados temporales
        sidebarCollapsed: state.sidebarCollapsed,
        currentView: state.currentView,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        compactMode: state.compactMode,
        highContrast: state.highContrast,
        reduceMotion: state.reduceMotion,
        fontSize: state.fontSize,
        dataDensity: state.dataDensity,
        realtimeValidation: state.realtimeValidation,
        autoSave: state.autoSave,
        filtersExpanded: state.filtersExpanded,
      }),
    }
  )
)

// ===== HOOKS AUXILIARES =====

// Hook para gestión de modales
export const useModals = () => {
  const store = useUIStore()
  return {
    activeModal: store.activeModal,
    modalData: store.modalData,
    openModal: store.openModal,
    closeModal: store.closeModal,
    closeAllModals: store.closeAllModals,
    isModalOpen: store.isModalOpen,
  }
}

// Hook para estados de carga
export const useLoadingStates = () => {
  const store = useUIStore()
  return {
    globalLoading: store.globalLoading,
    pageLoading: store.pageLoading,
    loadingMessage: store.loadingMessage,
    uploadProgress: store.uploadProgress,
    calculationProgress: store.calculationProgress,
    setGlobalLoading: store.setGlobalLoading,
    setLoading: store.setLoading,
    updateProgress: store.updateProgress,
    clearLoadings: store.clearLoadings,
  }
}

// Hook para navegación
export const useNavigation = () => {
  const store = useUIStore()
  return {
    sidebarCollapsed: store.sidebarCollapsed,
    sidebarHovered: store.sidebarHovered,
    currentPath: store.currentPath,
    activeTab: store.activeTab,
    filtersExpanded: store.filtersExpanded,
    currentView: store.currentView,
    toggleSidebar: store.toggleSidebar,
    setSidebarHover: store.setSidebarHover,
    updateBreadcrumbs: store.updateBreadcrumbs,
    setActiveTab: store.setActiveTab,
    toggleFilters: store.toggleFilters,
    setView: store.setView,
  }
}

// Hook para notificaciones
export const useNotifications = () => {
  const store = useUIStore()
  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    notificationsEnabled: store.notificationsEnabled,
    soundEnabled: store.soundEnabled,
    addNotification: store.addNotification,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    toggleNotifications: store.toggleNotifications,
    toggleSound: store.toggleSound,
  }
}

// Hook para preferencias de UI
export const useUIPreferences = () => {
  const store = useUIStore()
  return {
    compactMode: store.compactMode,
    highContrast: store.highContrast,
    reduceMotion: store.reduceMotion,
    fontSize: store.fontSize,
    dataDensity: store.dataDensity,
    toggleCompactMode: store.toggleCompactMode,
    toggleHighContrast: store.toggleHighContrast,
    toggleReduceMotion: store.toggleReduceMotion,
    setFontSize: store.setFontSize,
    setDataDensity: store.setDataDensity,
  }
}

// Hook para formularios
export const useFormStates = () => {
  const store = useUIStore()
  return {
    activeForm: store.activeForm,
    formDirty: store.formDirty,
    formErrors: store.formErrors,
    realtimeValidation: store.realtimeValidation,
    autoSave: store.autoSave,
    lastSaved: store.lastSaved,
    setActiveForm: store.setActiveForm,
    setFormDirty: store.setFormDirty,
    setFormErrors: store.setFormErrors,
    clearFormErrors: store.clearFormErrors,
    toggleRealtimeValidation: store.toggleRealtimeValidation,
    toggleAutoSave: store.toggleAutoSave,
    updateLastSaved: store.updateLastSaved,
  }
} 