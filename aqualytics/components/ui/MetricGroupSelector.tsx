'use client'

import React from 'react'
import { METRIC_GROUPS } from '@/lib/utils/metrics-mapping'

type MetricGroup = keyof typeof METRIC_GROUPS

interface MetricGroupSelectorProps {
  value: MetricGroup
  onChange: (group: MetricGroup) => void
  className?: string
}

export default function MetricGroupSelector({ 
  value, 
  onChange, 
  className = '' 
}: MetricGroupSelectorProps) {
  const groups = Object.entries(METRIC_GROUPS) as [MetricGroup, typeof METRIC_GROUPS[MetricGroup]][]

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${className}`}>
      {groups.map(([groupKey, groupData]) => (
        <button
          key={groupKey}
          onClick={() => onChange(groupKey)}
          className={`
            p-3 rounded-lg border text-left transition-all
            ${value === groupKey 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-background hover:bg-muted border-border'
            }
          `}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-lg">{groupData.icon}</span>
            <span className="font-medium text-sm">{groupData.name}</span>
          </div>
          <p className="text-xs opacity-80 leading-tight">
            {groupData.description}
          </p>
          <div className="mt-2 text-xs opacity-60">
            {groupData.metrics.length} métricas
          </div>
        </button>
      ))}
    </div>
  )
} 