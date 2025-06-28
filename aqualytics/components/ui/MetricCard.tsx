/**
 * MetricCard - Componente para mostrar métricas clave del dashboard
 * Diseñado con tema Phoenix y optimizado para MVP
 */

'use client'

import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: string
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  gradient?: string
}

export default function MetricCard({ 
  title, 
  value, 
  icon = '📊', 
  subtitle,
  trend,
  gradient = 'from-phoenix-red to-phoenix-orange'
}: MetricCardProps) {
  return (
    <div className="group phoenix-card relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-2">
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} 
            flex items-center justify-center shadow-lg
            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
          `}>
            <span className="text-2xl text-white drop-shadow-sm">{icon}</span>
          </div>
          
          {trend && (
            <div className={`
              flex items-center gap-1 text-sm font-medium
              ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
            `}>
              <span className="text-lg">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <p className="text-3xl font-bold tracking-tight group-hover:scale-105 transition-transform duration-300 origin-left">
            {value}
          </p>
          {(subtitle || trend) && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
              {trend && (
                <span className="ml-1 text-xs">
                  ({trend.label})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Decorative element */}
        <div className={`
          absolute -bottom-2 -right-2 w-24 h-24 
          bg-gradient-to-br ${gradient} opacity-10 
          rounded-full blur-2xl
          group-hover:scale-150 transition-transform duration-700
        `}></div>
      </div>
    </div>
  )
} 