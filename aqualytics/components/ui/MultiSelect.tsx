'use client'

import React, { useState } from 'react'

interface Option {
  value: string | number
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selectedValues: (string | number)[]
  onChange: (values: (string | number)[]) => void
  placeholder?: string
  maxSelections?: number
  className?: string
}

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Seleccionar...",
  maxSelections = 5,
  className = ""
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionClick = (value: string | number) => {
    if (selectedValues.includes(value)) {
      // Remover si ya está seleccionado
      onChange(selectedValues.filter(v => v !== value))
    } else if (selectedValues.length < maxSelections) {
      // Agregar si no está seleccionado y no excede el máximo
      onChange([...selectedValues, value])
    }
  }

  const getSelectedLabels = () => {
    return selectedValues
      .map(value => options.find(opt => opt.value === value)?.label)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left border rounded-lg bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex justify-between items-center">
          <span className={selectedValues.length === 0 ? 'text-muted-foreground' : ''}>
            {selectedValues.length === 0 
              ? placeholder 
              : selectedValues.length === 1 
                ? getSelectedLabels()
                : `${selectedValues.length} seleccionados`
            }
          </span>
          <span className="text-muted-foreground">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-muted-foreground">No hay opciones disponibles</div>
          ) : (
            options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={`w-full px-3 py-2 text-left hover:bg-muted flex items-center justify-between ${
                  selectedValues.includes(option.value) ? 'bg-primary/10 text-primary' : ''
                }`}
                disabled={!selectedValues.includes(option.value) && selectedValues.length >= maxSelections}
              >
                <span>{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))
          )}
          
          {selectedValues.length > 0 && (
            <div className="border-t px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Cerrar dropdown al hacer click fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 