/**
 * Página de Administración - Gestión de Datos de Referencia
 */

'use client'

import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card } from '@/components/ui/Card'

export default function AdminPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-2xl px-6 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Administración de Datos de Referencia
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestiona competencias, distancias, estilos, fases y parámetros del sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                API de Competencias
              </h2>
              <div className="space-y-2 text-sm">
                <div>✅ GET /api/competitions</div>
                <div>✅ POST /api/competitions</div>
                <div>✅ PUT /api/competitions</div>
                <div>✅ DELETE /api/competitions</div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">
                API de Datos de Referencia
              </h2>
              <div className="space-y-2 text-sm">
                <div>✅ GET /api/reference (distancias)</div>
                <div>✅ GET /api/reference (estilos)</div>
                <div>✅ GET /api/reference (fases)</div>
                <div>✅ POST, PUT, DELETE implementados</div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Estado de la Tarea 12
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-phoenix-green text-xl">✅</span>
                <span>Backend APIs - Completados y probados</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-phoenix-green text-xl">✅</span>
                <span>Validación de datos - Implementada</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-phoenix-yellow text-xl">⚠️</span>
                <span>Frontend UI - Próxima iteración</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
} 