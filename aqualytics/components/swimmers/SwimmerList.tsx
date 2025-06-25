'use client'

/**
 * Lista de Nadadores - AquaLytics
 * Componente para mostrar, buscar y gestionar nadadores
 */

import React, { useState } from 'react'
import { useSwimmers, useSwimmerSearch } from '@/lib/hooks/useSwimmers'
import { SwimmerForm } from '@/components/forms/SwimmerForm'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import type { Nadador } from '@/lib/types/database'
import type { SwimmerFormData } from '@/lib/utils/validators'

// ===== TIPOS =====

interface SwimmerListProps {
  /**
   * Mostrar estadísticas de los nadadores
   */
  showStats?: boolean
  
  /**
   * Permitir selección de nadadores
   */
  selectable?: boolean
  
  /**
   * Nadador seleccionado (para modo selección)
   */
  selectedSwimmer?: Nadador | null
  
  /**
   * Callback cuando se selecciona un nadador
   */
  onSwimmerSelect?: (swimmer: Nadador) => void
  
  /**
   * Clase CSS adicional
   */
  className?: string
}

interface SwimmerCardProps {
  swimmer: Nadador
  onEdit?: (swimmer: Nadador) => void
  onDelete?: (swimmer: Nadador) => void
  onSelect?: (swimmer: Nadador) => void
  isSelected?: boolean
  isDeleting?: boolean
  showStats?: boolean
}

// ===== ICONOS =====

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const DeleteIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const StatsIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

// ===== COMPONENTE DE TARJETA DE NADADOR =====

function SwimmerCard({
  swimmer,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  isDeleting = false,
  showStats = false
}: SwimmerCardProps) {
  
  return (
    <Card 
      className={`p-4 transition-all duration-200 hover:shadow-phoenix-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-phoenix-red bg-phoenix-red/5' : ''
      }`}
      onClick={() => onSelect?.(swimmer)}
    >
      <div className="flex items-start justify-between">
        
        {/* Información del nadador */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-phoenix-red to-phoenix-orange rounded-full flex items-center justify-center text-white font-bold">
              {swimmer.nombre.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-grow min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {swimmer.nombre}
              </h3>
              
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {swimmer.edad && (
                  <span>{swimmer.edad} años</span>
                )}
                {swimmer.peso && (
                  <span>{swimmer.peso} kg</span>
                )}
                <span className="text-xs bg-phoenix-orange/10 text-phoenix-orange px-2 py-0.5 rounded">
                  ID: {swimmer.id_nadador}
                </span>
              </div>
            </div>
          </div>

                     {/* Estadísticas si están habilitadas */}
           {showStats && 'totalRegistros' in swimmer && (
             <div className="mt-3 p-2 bg-gradient-to-r from-phoenix-yellow/10 to-phoenix-amber/10 rounded-lg">
               <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-1">
                   <StatsIcon />
                   <span>Registros: {(swimmer as typeof swimmer & { totalRegistros?: number }).totalRegistros || 0}</span>
                 </div>
                 {'ultimaParticipacion' in swimmer && (swimmer as typeof swimmer & { ultimaParticipacion?: string }).ultimaParticipacion && (
                   <span className="text-muted-foreground">
                     Último: {new Date((swimmer as typeof swimmer & { ultimaParticipacion: string }).ultimaParticipacion).toLocaleDateString()}
                   </span>
                 )}
               </div>
             </div>
           )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2 ml-4">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(swimmer)
              }}
              disabled={isDeleting}
            >
              <EditIcon />
            </Button>
          )}
          
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(swimmer)
              }}
              disabled={isDeleting}
              loading={isDeleting}
            >
              <DeleteIcon />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// ===== COMPONENTE PRINCIPAL =====

export function SwimmerList({
  showStats = false,
  selectable = false,
  selectedSwimmer,
  onSwimmerSelect,
  className = ''
}: SwimmerListProps) {
  
  // Estados locales
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingSwimmer, setEditingSwimmer] = useState<Nadador | null>(null)
  const [deletingSwimmer, setDeletingSwimmer] = useState<Nadador | null>(null)

  // Hooks para gestión de nadadores
  const {
    swimmers,
    isLoading,
    error,
    createSwimmer,
    updateSwimmer,
    deleteSwimmer,
    refreshSwimmers,
    isOperating,
    clearError
  } = useSwimmers({ includeStats: showStats })

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    hasSearchTerm
  } = useSwimmerSearch()

  // Determinar qué nadadores mostrar
  const displayedSwimmers = hasSearchTerm ? searchResults : swimmers

  // Manejar creación de nadador
  const handleCreateSwimmer = async (data: SwimmerFormData) => {
    await createSwimmer(data)
    setShowCreateForm(false)
  }

  // Manejar actualización de nadador
  const handleUpdateSwimmer = async (data: SwimmerFormData) => {
    if (!editingSwimmer) return
    await updateSwimmer({ ...data, id_nadador: editingSwimmer.id_nadador })
    setEditingSwimmer(null)
  }

  // Manejar eliminación de nadador
  const handleDeleteSwimmer = async (swimmer: Nadador) => {
    try {
      setDeletingSwimmer(swimmer)
      await deleteSwimmer(swimmer.id_nadador)
      setDeletingSwimmer(null)
    } catch (_error) {
      setDeletingSwimmer(null)
      // El error se muestra automáticamente
    }
  }

  // Confirmar eliminación
  const confirmDelete = (swimmer: Nadador) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${swimmer.nombre}?`)) {
      handleDeleteSwimmer(swimmer)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header y controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestión de Nadadores
          </h2>
          <p className="text-muted-foreground">
            {swimmers.length} nadador{swimmers.length !== 1 ? 'es' : ''} registrado{swimmers.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={refreshSwimmers}
            disabled={isLoading}
            startIcon={<RefreshIcon />}
          >
            Actualizar
          </Button>
          
          <Button
            variant="phoenix"
            size="md"
            onClick={() => setShowCreateForm(true)}
            startIcon={<PlusIcon />}
          >
            Nuevo Nadador
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="max-w-md">
        <Input
          placeholder="Buscar nadadores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          startIcon={<SearchIcon />}
          variant="phoenix"
          fullWidth
        />
      </div>

      {/* Manejo de errores */}
      {error && (
        <Card className="p-4 border-phoenix-crimson/20 bg-phoenix-crimson/5">
          <div className="flex items-center justify-between">
            <p className="text-phoenix-crimson">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
            >
              Cerrar
            </Button>
          </div>
        </Card>
      )}

      {/* Estados de carga */}
      {(isLoading || isSearching) && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">
            {isSearching ? 'Buscando...' : 'Cargando nadadores...'}
          </span>
        </div>
      )}

      {/* Lista de nadadores */}
      {!isLoading && !isSearching && (
        <>
          {displayedSwimmers.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                {hasSearchTerm 
                  ? `No se encontraron nadadores que coincidan con "${searchTerm}"`
                  : 'No hay nadadores registrados. Crea el primero usando el botón "Nuevo Nadador".'
                }
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedSwimmers.map((swimmer) => (
                <SwimmerCard
                  key={swimmer.id_nadador}
                  swimmer={swimmer}
                  onEdit={setEditingSwimmer}
                  onDelete={confirmDelete}
                  onSelect={selectable ? onSwimmerSelect : undefined}
                  isSelected={selectable && selectedSwimmer?.id_nadador === swimmer.id_nadador}
                  isDeleting={deletingSwimmer?.id_nadador === swimmer.id_nadador}
                  showStats={showStats}
                />
              ))}
            </div>
          )}
        </>
      )}

             {/* Modal de creación */}
       <Modal
         open={showCreateForm}
         onClose={() => setShowCreateForm(false)}
         title="Crear Nuevo Nadador"
       >
         <SwimmerForm
           onSubmit={handleCreateSwimmer}
           onCancel={() => setShowCreateForm(false)}
           isSubmitting={isOperating}
         />
       </Modal>

       {/* Modal de edición */}
       <Modal
         open={!!editingSwimmer}
         onClose={() => setEditingSwimmer(null)}
         title="Editar Nadador"
       >
         {editingSwimmer && (
           <SwimmerForm
             swimmer={editingSwimmer}
             onSubmit={handleUpdateSwimmer}
             onCancel={() => setEditingSwimmer(null)}
             isSubmitting={isOperating}
           />
         )}
       </Modal>
    </div>
  )
}

// ===== EXPORTACIONES ADICIONALES =====

export { SwimmerCard } 