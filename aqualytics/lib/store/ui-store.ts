/**
 * UI Store - Zustand State Management (MVP Version)
 * Gestión básica de estados de interfaz de usuario
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// ===== TIPOS DEL STORE =====

interface UIStore {
  // Estados de modales
  createSwimmerModal: boolean
  editSwimmerModal: boolean
  deleteSwimmerModal: boolean
  createMetricModal: boolean
  activeModal: string | null
  modalData: unknown
  
  // Estados de loading
  loading: boolean
  loadingMessage: string | null
  
  // Estados de navegación
  sidebarCollapsed: boolean
  currentView: 'list' | 'cards' | 'table'
  
  // Preferencias de UI
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  
  // ===== GESTIÓN DE MODALES =====
  
  // Abrir modal
  openModal: (modalName: string, data?: unknown) => void
  
  // Cerrar modal
  closeModal: (modalName: string) => void
  
  // Cerrar todos los modales
  closeAllModals: () => void
  
  // ===== GESTIÓN DE LOADING =====
  
  // Set loading
  setLoading: (loading: boolean, message?: string) => void
  
  // ===== GESTIÓN DE NAVEGACIÓN =====
  
  // Toggle sidebar
  toggleSidebar: () => void
  
  // Cambiar vista
  setView: (view: 'list' | 'cards' | 'table') => void
  
  // ===== GESTIÓN DE PREFERENCIAS =====
  
  // Cambiar tema
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Cambiar tamaño de fuente
  setFontSize: (size: 'small' | 'medium' | 'large') => void
  
  // ===== UTILIDADES =====
  
  // Reset
  reset: () => void
}

// ===== ESTADO INICIAL =====

const initialState = {
  // Modales
  createSwimmerModal: false,
  editSwimmerModal: false,
  deleteSwimmerModal: false,
  createMetricModal: false,
  activeModal: null,
  modalData: null,
  
  // Loading
  loading: false,
  loadingMessage: null,
  
  // Navegación
  sidebarCollapsed: false,
  currentView: 'table' as const,
  
  // Preferencias
  theme: 'system' as const,
  fontSize: 'medium' as const,
}

// ===== STORE PRINCIPAL =====

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ===== MODALES =====
      
      openModal: (modalName: string, data?: unknown) => {
        const modalKey = `${modalName}Modal`
        set({
          [modalKey]: true,
          activeModal: modalName,
          modalData: data || null,
        })
      },
      
      closeModal: (modalName: string) => {
        const modalKey = `${modalName}Modal`
        set(state => ({
          [modalKey]: false,
          activeModal: state.activeModal === modalName ? null : state.activeModal,
          modalData: state.activeModal === modalName ? null : state.modalData,
        }))
      },
      
      closeAllModals: () => {
        set({
          createSwimmerModal: false,
          editSwimmerModal: false,
          deleteSwimmerModal: false,
          createMetricModal: false,
          activeModal: null,
          modalData: null,
        })
      },
      
      // ===== LOADING =====
      
      setLoading: (loading: boolean, message?: string) => {
        set({
          loading,
          loadingMessage: loading ? (message || null) : null,
        })
      },
      
      // ===== NAVEGACIÓN =====
      
      toggleSidebar: () => {
        set(state => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }))
      },
      
      setView: (view: 'list' | 'cards' | 'table') => {
        set({ currentView: view })
      },
      
      // ===== PREFERENCIAS =====
      
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme })
        
        // Aplicar tema al DOM
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setFontSize: (fontSize: 'small' | 'medium' | 'large') => {
        set({ fontSize })
        
        // Aplicar tamaño de fuente al DOM
        const root = document.documentElement
        switch (fontSize) {
          case 'small':
            root.style.fontSize = '14px'
            break
          case 'large':
            root.style.fontSize = '18px'
            break
          default:
            root.style.fontSize = '16px'
        }
      },
      
      // ===== UTILIDADES =====
      
      reset: () => {
        const { theme, fontSize, sidebarCollapsed } = get()
        set({
          ...initialState,
          // Preservar preferencias de usuario
          theme,
          fontSize,
          sidebarCollapsed,
        })
      },
    }),
    {
      name: 'aqualytics-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Solo persistir preferencias de usuario
        theme: state.theme,
        fontSize: state.fontSize,
        sidebarCollapsed: state.sidebarCollapsed,
        currentView: state.currentView,
      }),
    }
  )
) 