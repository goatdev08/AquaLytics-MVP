/**
 * ModalManager - Sistema de gestión de modales centralizados
 * Integra formularios existentes con el store de UI
 */

'use client'

import { useUIStore, useSwimmersStore } from '@/lib/store'
import { Modal } from '@/components/ui/Modal'
import { CSVUploader } from '@/components/forms/CSVUploader'
import { SwimmerForm } from '@/components/forms/SwimmerForm'

export function ModalManager() {
  const { 
    createMetricModal,
    createSwimmerModal,
    activeModal,
    modalData,
    closeModal,
    closeAllModals
  } = useUIStore()

  const { createSwimmer } = useSwimmersStore()

  // Estado de modales específicos
  const uploadCSVModal = activeModal === 'uploadCSV'

  // Handlers para formularios
  const handleSwimmerSubmit = async (data: { nombre: string; edad?: number; categoria?: string }) => {
    await createSwimmer(data)
    closeModal('createSwimmer')
  }

  const handleCSVFileSelect = (file: File) => {
    console.log('CSV file selected:', file.name)
    // Aquí se procesaría el archivo CSV
    // Por ahora solo mostramos el archivo seleccionado
  }

  const handleMetricsSubmit = async () => {
    // El MetricsForm maneja su propia lógica de envío
    // Solo necesitamos cerrar el modal
    closeModal('createMetric')
    // Las actualizaciones en tiempo real se manejarán automáticamente por los stores
  }

  return (
    <>
      {/* Modal para nuevo registro de métricas */}
      <Modal
        open={createMetricModal}
        onClose={() => closeModal('createMetric')}
        title="Nuevo Registro de Métricas"
        size="xl"
        className="max-w-4xl"
      >
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Formulario de métricas se integrará en próxima iteración</p>
            <button
              className="mt-4 px-4 py-2 bg-phoenix-red text-white rounded-md hover:bg-phoenix-red/90"
              onClick={handleMetricsSubmit}
            >
              Simular Envío
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para carga de CSV */}
      <Modal
        open={uploadCSVModal}
        onClose={() => closeModal('uploadCSV')}
        title="Cargar Datos desde CSV"
        size="lg"
        className="max-w-3xl"
      >
        <div className="p-6">
          <CSVUploader
            onFileSelect={handleCSVFileSelect}
            onUploadProgress={(progress) => console.log('Upload progress:', progress)}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              className="px-4 py-2 border border-border rounded-md hover:bg-muted"
              onClick={() => closeModal('uploadCSV')}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para crear nadador */}
      <Modal
        open={createSwimmerModal}
        onClose={() => closeModal('createSwimmer')}
        title="Nuevo Nadador"
        size="md"
        className="max-w-md"
      >
        <div className="p-6">
          <SwimmerForm
            onSubmit={handleSwimmerSubmit}
            onCancel={() => closeModal('createSwimmer')}
            showCancel={false}
          />
        </div>
      </Modal>

      {/* Modal genérico con datos personalizados */}
      {activeModal && !['createMetric', 'uploadCSV', 'createSwimmer'].includes(activeModal) && (
        <Modal
          open={!!activeModal}
          onClose={closeAllModals}
          title={`Modal: ${activeModal}`}
          size="md"
        >
          <div className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Modal personalizado: {activeModal}</p>
              {Boolean(modalData) && (
                <pre className="mt-4 text-xs bg-muted p-3 rounded-md text-left overflow-auto">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {String(modalData as any)}
                </pre>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
} 