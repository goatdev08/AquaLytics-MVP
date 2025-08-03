'use client'

/**
 * Página Principal de Análisis - AquaLytics
 * Sistema completo de análisis para comparación de nadadores y rendimiento
 */

import React, { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SwimmerComparison } from './components/SwimmerComparison'
import { SelfComparison } from './components/SelfComparison'
import { PerformanceInsights } from './components/PerformanceInsights'

type AnalysisTab = 'comparison' | 'self' | 'insights'

const TABS = [
  {
    id: 'comparison' as AnalysisTab,
    name: 'Comparación entre Nadadores',
    description: 'Compara 2-4 nadadores en la misma prueba',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: 'self' as AnalysisTab,
    name: 'Comparación Personal',
    description: 'Compara el mismo nadador en diferentes fechas/fases',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 'insights' as AnalysisTab,
    name: 'Insights de Rendimiento',
    description: 'Análisis avanzados y recomendaciones',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012-2z" />
      </svg>
    )
  }
] as const

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('comparison')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'comparison':
        return <SwimmerComparison />
      case 'self':
        return <SelfComparison />
      case 'insights':
        return <PerformanceInsights />
      default:
        return null
    }
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        {/* Header del Dashboard */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-phoenix-red via-phoenix-orange to-phoenix-yellow bg-clip-text text-transparent">
              Análisis de Rendimiento
            </h2>
            <p className="text-muted-foreground mt-2">
              Compara nadadores y analiza progresión con insights detallados
            </p>
          </div>
        </div>

        {/* Sistema de Tabs */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {TABS.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'phoenix' : 'outline'}
                size="lg"
                onClick={() => setActiveTab(tab.id)}
                className={`h-auto p-4 flex flex-col items-start gap-2 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'shadow-lg border-phoenix-orange/50 bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10' 
                    : 'hover:shadow-md hover:border-phoenix-orange/30'
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-phoenix-red to-phoenix-orange text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm">{tab.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Contenido del Tab Activo */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
} 