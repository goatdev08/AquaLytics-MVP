'use client'

import React from 'react'

// Tipo local para evitar dependencia faltante
type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y' | 'all'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

const TIME_RANGE_OPTIONS = [
  { value: '7d' as TimeRange, label: 'Últimos 7 días', shortLabel: '7d' },
  { value: '30d' as TimeRange, label: 'Últimos 30 días', shortLabel: '30d' },
  { value: '3m' as TimeRange, label: 'Últimos 3 meses', shortLabel: '3m' },
  { value: '1y' as TimeRange, label: 'Último año', shortLabel: '1y' }
]

export default function TimeRangeSelector({ value, onChange, className = '' }: TimeRangeSelectorProps) {
  return (
    <div className={`flex rounded-lg border overflow-hidden ${className}`}>
      {TIME_RANGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-2 text-sm font-medium transition-colors border-r last:border-r-0
            ${value === option.value 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-background hover:bg-muted text-foreground'
            }
          `}
          title={option.label}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  )
} 