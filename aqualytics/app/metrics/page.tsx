/**
 * Página de Entrada Manual de Métricas
 * Formulario completo para registrar métricas de natación en competencias
 */

'use client'

import React, { useState } from 'react'
import { MetricsForm } from '@/components/forms/MetricsForm'
import MainLayout from '@/components/layout/MainLayout'
import { type MetricFormData } from '@/lib/utils/validators'
import { toast } from 'react-hot-toast'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('MetricsPage')

export default function MetricsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar el envío del formulario
  const handleSubmit = async (data: MetricFormData) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Guardando registro...');
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al guardar el registro');
      }

      toast.success('¡Éxito! El registro se ha guardado correctamente.', { id: toastId });
      
    } catch (error) {
      logger.error('❌ Error guardando métricas:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo guardar el registro.';
      toast.error(`Error: ${errorMessage}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 phoenix-title">
            Entrada Manual de Métricas
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Registra métricas detalladas de natación con análisis en tiempo real. 
            Sistema completo de validación y cálculos automáticos de rendimiento.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <MetricsForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </div>
    </MainLayout>
  )
} 