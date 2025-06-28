'use client'

import React, { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { METRIC_GROUPS } from '@/lib/utils/metrics-mapping'

// Componentes de tabs (los crearemos después)
import OverviewTab from '@/components/analytics/OverviewTab'
import ComparisonsTab from '@/components/analytics/ComparisonsTab'
import RankingsTab from '@/components/analytics/RankingsTab'
import EfficiencyTab from '@/components/analytics/EfficiencyTab'

type TabType = 'overview' | 'comparisons' | 'rankings' | 'efficiency'

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs = [
    {
      id: 'overview' as TabType,
      name: 'Overview del Equipo',
      icon: '📊',
      description: 'Estadísticas generales y % de mejora'
    },
    {
      id: 'comparisons' as TabType, 
      name: 'Comparaciones',
      icon: '⚔️',
      description: 'Compara nadadores en misma distancia/estilo'
    },
    {
      id: 'rankings' as TabType,
      name: 'Rankings', 
      icon: '🏆',
      description: 'Rankings por estilo y distancia'
    },
    {
      id: 'efficiency' as TabType,
      name: 'Eficiencia de Brazada',
      icon: '🏊‍♂️', 
      description: 'Análisis de eficiencia por estilo'
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'comparisons':
        return <ComparisonsTab />
      case 'rankings':
        return <RankingsTab />
      case 'efficiency':
        return <EfficiencyTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto max-w-screen-2xl px-6 py-8">
        {/* Header con gradiente Phoenix */}
        <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-yellow p-8 phoenix-shadow-xl">
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-white/90 max-w-4xl leading-relaxed">
              Análisis avanzado de rendimiento con filtros por tipo de métrica. 
              Compara nadadores, visualiza progresión y obtén insights valiosos del equipo.
            </p>
          </div>
          {/* Patrón decorativo */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Filtros de métricas con diseño mejorado */}
        <div className="mb-10 p-8 bg-card rounded-2xl border phoenix-shadow-warm phoenix-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl phoenix-gradient flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Filtros por Tipo de Métrica
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecciona el tipo de análisis que deseas realizar
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(METRIC_GROUPS).map(([key, group]) => (
              <div 
                key={key} 
                className="group p-5 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border hover:border-phoenix-red/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-phoenix-red/20 to-phoenix-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{group.icon}</span>
                  </div>
                  <h4 className="font-semibold text-foreground group-hover:text-phoenix-red transition-colors">
                    {group.name}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {group.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-phoenix-orange">
                    {group.metrics.length} métricas
                  </span>
                  <div className="w-6 h-6 rounded-full bg-phoenix-red/10 flex items-center justify-center group-hover:bg-phoenix-red/20 transition-colors">
                    <svg className="w-3 h-3 text-phoenix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs mejorados */}
        <div className="mb-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-1 phoenix-shadow">
            <nav className="flex flex-wrap gap-1" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-4 rounded-lg font-medium transition-all duration-300
                    flex items-center gap-3 group
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-phoenix-red to-phoenix-orange text-white shadow-lg scale-105'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                  <span className={`
                    text-2xl transition-transform duration-300
                    ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}
                  `}>
                    {tab.icon}
                  </span>
                  <div className="text-left">
                    <div className="font-semibold">{tab.name}</div>
                    <div className={`
                      text-xs font-normal transition-opacity duration-300
                      ${activeTab === tab.id ? 'text-white/80' : 'text-muted-foreground opacity-80'}
                    `}>
                      {tab.description}
                    </div>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-phoenix-yellow to-phoenix-amber"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content con animación */}
        <div className="min-h-[600px] animate-in fade-in-50 duration-500">
          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  )
} 