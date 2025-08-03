/**
 * Página de Administración - Gestión de Datos de Referencia
 */

'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card } from '@/components/ui/Card'
import { CompetitionForm } from '@/components/forms/CompetitionForm'
import { CompetitionSchema } from '@/lib/utils/validators'
import type { z } from 'zod'

type CompetitionFormData = z.infer<typeof CompetitionSchema>
import { useToaster } from '@/lib/hooks/useToaster'

export default function AdminPage() {
  const { showToast } = useToaster()

  const handleCreateCompetition = async (data: CompetitionFormData) => {
    try {
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la competencia');
      }

      const newCompetition = await response.json();
      showToast({
        title: 'Éxito',
        message: `Competencia "${newCompetition.data.competencia}" creada.`,
        type: 'success',
      });
      // Aquí podrías añadir lógica para refrescar una lista de competencias si la hubiera
    } catch (error) {
      showToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        type: 'error',
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-2xl px-6 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Administración
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona competencias, y otros datos de referencia del sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Crear Nueva Competencia
              </h2>
              <p className="text-muted-foreground mb-6">
                Usa este formulario para añadir un nuevo evento o temporada al sistema.
              </p>
              <CompetitionForm onSubmit={handleCreateCompetition} />
            </Card>
            
            <Card className="p-6 bg-secondary">
              <h2 className="text-xl font-bold text-foreground mb-4">
                Próximamente
              </h2>
              <p className="text-muted-foreground">
                Aquí se mostrarán listas para gestionar distancias, estilos y fases.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 