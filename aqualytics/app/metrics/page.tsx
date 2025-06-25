/**
 * Página de Entrada Manual de Métricas
 * Formulario completo para registrar métricas de natación en competencias
 */

'use client'

import React from 'react'
import { MetricsForm } from '@/components/forms/MetricsForm'
import MainLayout from '@/components/layout/MainLayout'
import { type MetricFormData } from '@/lib/utils/validators'

export default function MetricsPage() {
  
  // Función para manejar el envío del formulario
  const handleSubmit = async (data: MetricFormData) => {
    try {
      console.log('📊 Datos de métricas recibidos:', data)
      
      // TODO: Integrar con API de AquaLytics
      // Por ahora simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mostrar feedback exitoso (por ahora en consola)
      console.log('✅ Métricas guardadas exitosamente')
      alert('¡Métricas guardadas exitosamente! 🏊‍♂️')
      
    } catch (error) {
      console.error('❌ Error guardando métricas:', error)
      alert('Error al guardar las métricas. Por favor intenta nuevamente.')
    }
  }
  
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
          <MetricsForm onSubmit={handleSubmit} />
        </div>
      </div>
    </MainLayout>
  )
} 