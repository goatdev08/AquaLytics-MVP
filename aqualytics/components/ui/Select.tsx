import React, { forwardRef, useState, useRef, useEffect, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

export interface SelectProps {
  /**
   * Select variant
   */
  variant?: 'default' | 'phoenix' | 'warm' | 'sunset'
  
  /**
   * Select size
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Validation state
   */
  state?: 'default' | 'error' | 'success' | 'warning'
  
  /**
   * Select options
   */
  options: SelectOption[]
  
  /**
   * Selected value
   */
  value?: string
  
  /**
   * Default value
   */
  defaultValue?: string
  
  /**
   * Placeholder text
   */
  placeholder?: string
  
  /**
   * Label text
   */
  label?: string
  
  /**
   * Helper text
   */
  helperText?: string
  
  /**
   * Error message
   */
  error?: string
  
  /**
   * Success message
   */
  success?: string
  
  /**
   * Warning message
   */
  warning?: string
  
  /**
   * Disabled state
   */
  disabled?: boolean
  
  /**
   * Required field indicator
   */
  required?: boolean
  
  /**
   * Full width select
   */
  fullWidth?: boolean
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Change handler
   */
  onChange?: (value: string, option: SelectOption) => void
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Unique identifier
   */
  id?: string
}

const ChevronDownIcon = () => (
  <svg className="h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const CheckIcon = () => (
  <svg className="h-4 w-4 text-current" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-phoenix-orange"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Phoenix-themed Select component with custom dropdown and advanced styling.
 * 
 * @param variant - Select style variant
 * @param size - Select size
 * @param state - Validation state
 * @param options - Select options
 * @param value - Selected value
 * @param defaultValue - Default value
 * @param placeholder - Placeholder text
 * @param label - Label text
 * @param helperText - Helper text
 * @param error - Error message
 * @param success - Success message
 * @param warning - Warning message
 * @param disabled - Disabled state
 * @param required - Required field indicator
 * @param fullWidth - Full width select
 * @param loading - Loading state
 * @param onChange - Change handler
 * @param className - Additional CSS classes
 * @param id - Unique identifier
 */
const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    variant = 'default',
    size = 'md',
    state = 'default',
    options,
    value,
    defaultValue,
    placeholder = 'Seleccionar opción...',
    label,
    helperText,
    error,
    success,
    warning,
    disabled = false,
    required = false,
    fullWidth = false,
    loading = false,
    onChange,
    className,
    id
  }, ref) => {
    
    const [isOpen, setIsOpen] = useState(false)
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
    const [focusedIndex, setFocusedIndex] = useState(-1)
    
    const selectRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    
    // Determine actual state based on props
    const actualState = error ? 'error' : success ? 'success' : warning ? 'warning' : state
    
    // Generate unique ID if not provided (SSR-safe)
    const generatedId = useId()
    const selectId = id || `select-${generatedId}`
    const helperId = `${selectId}-helper`
    const listId = `${selectId}-listbox`
    
    // Find selected option
    const selectedOption = options.find(option => option.value === selectedValue)
    
    // Update selected value when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setFocusedIndex(-1)
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    
    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled || loading) return
      
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
            setFocusedIndex(0)
          } else if (focusedIndex >= 0) {
            selectOption(options[focusedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setFocusedIndex(-1)
          buttonRef.current?.focus()
          break
        case 'ArrowDown':
          event.preventDefault()
          if (!isOpen) {
            setIsOpen(true)
            setFocusedIndex(0)
          } else {
            setFocusedIndex(prev => Math.min(prev + 1, options.length - 1))
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          if (isOpen) {
            setFocusedIndex(prev => Math.max(prev - 1, 0))
          }
          break
        case 'Tab':
          setIsOpen(false)
          setFocusedIndex(-1)
          break
      }
    }
    
    const selectOption = (option: SelectOption) => {
      if (option.disabled) return
      
      setSelectedValue(option.value)
      setIsOpen(false)
      setFocusedIndex(-1)
      onChange?.(option.value, option)
      buttonRef.current?.focus()
    }
    
    const baseSelectClasses = [
      'relative w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Full width
      fullWidth ? 'w-full' : 'w-auto',
    ]
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg'
    }
    
    const variantClasses = {
      default: [
        'bg-input border-border text-foreground',
        'focus:border-phoenix-red focus:ring-phoenix-red/20'
      ],
      phoenix: [
        'bg-gradient-to-r from-phoenix-red/5 to-phoenix-orange/5 border-phoenix-red/30',
        'text-foreground focus:border-phoenix-red focus:ring-phoenix-red/20',
        'hover:from-phoenix-red/10 hover:to-phoenix-orange/10'
      ],
      warm: [
        'bg-gradient-to-r from-phoenix-orange/5 to-phoenix-yellow/5 border-phoenix-orange/30',
        'text-foreground focus:border-phoenix-orange focus:ring-phoenix-orange/20',
        'hover:from-phoenix-orange/10 hover:to-phoenix-yellow/10'
      ],
      sunset: [
        'bg-gradient-to-r from-phoenix-sunset/5 to-phoenix-gold/5 border-phoenix-sunset/30',
        'text-foreground focus:border-phoenix-sunset focus:ring-phoenix-sunset/20',
        'hover:from-phoenix-sunset/10 hover:to-phoenix-gold/10'
      ]
    }
    
    const stateClasses = {
      default: variantClasses[variant],
      error: [
        'bg-phoenix-crimson/5 border-phoenix-crimson text-foreground',
        'focus:border-phoenix-crimson focus:ring-phoenix-crimson/20'
      ],
      success: [
        'bg-phoenix-yellow/5 border-phoenix-yellow text-foreground',
        'focus:border-phoenix-yellow focus:ring-phoenix-yellow/20'
      ],
      warning: [
        'bg-phoenix-amber/5 border-phoenix-amber text-foreground',
        'focus:border-phoenix-amber focus:ring-phoenix-amber/20'
      ]
    }
    
    const labelClasses = [
      'block text-sm font-medium text-foreground mb-1.5',
      actualState === 'error' && 'text-phoenix-crimson',
      actualState === 'success' && 'text-phoenix-yellow',
      actualState === 'warning' && 'text-phoenix-amber'
    ]
    
    const helperTextClasses = [
      'text-sm mt-1.5 flex items-center gap-1.5',
      actualState === 'default' && 'text-muted-foreground',
      actualState === 'error' && 'text-phoenix-crimson',
      actualState === 'success' && 'text-phoenix-yellow',
      actualState === 'warning' && 'text-phoenix-amber'
    ]

    return (
      <div ref={ref} className={cn('relative', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={selectId}
            className={cn(labelClasses)}
          >
            {label}
            {required && (
              <span className="text-phoenix-crimson ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        {/* Select Container */}
        <div ref={selectRef} className="relative">
          {/* Select Button */}
          <button
            ref={buttonRef}
            type="button"
            id={selectId}
            className={cn(
              baseSelectClasses,
              sizeClasses[size],
              stateClasses[actualState],
              'flex items-center justify-between w-full cursor-pointer',
              disabled && 'cursor-not-allowed',
              isOpen && 'ring-2 ring-phoenix-red/20'
            )}
            disabled={disabled || loading}
            onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? `${selectId}-label` : undefined}
            aria-describedby={
              (helperText || error || success || warning) ? helperId : undefined
            }
            aria-required={required}
          >
            <span className={cn(
              'block truncate text-left',
              !selectedOption && 'text-muted-foreground'
            )}>
              {selectedOption?.label || placeholder}
            </span>
            
            <span className="flex items-center ml-2">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <ChevronDownIcon />
              )}
            </span>
          </button>
          
          {/* Dropdown */}
          {isOpen && !disabled && !loading && (
            <ul
              ref={listRef}
              id={listId}
              className={cn(
                'absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg',
                'max-h-60 overflow-auto py-1',
                'phoenix-shadow-lg'
              )}
              role="listbox"
              aria-labelledby={selectId}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  className={cn(
                    'px-4 py-2 cursor-pointer text-sm transition-colors duration-150',
                    'hover:bg-phoenix-red/10 hover:text-phoenix-red',
                    'flex items-center justify-between',
                    focusedIndex === index && 'bg-phoenix-red/10 text-phoenix-red',
                    selectedValue === option.value && 'bg-phoenix-red/5 text-phoenix-red font-medium',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  role="option"
                  aria-selected={selectedValue === option.value}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="flex flex-col">
                    <span className="block truncate">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </div>
                  
                  {selectedValue === option.value && (
                    <CheckIcon />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Helper Text / Error / Success / Warning */}
        {(helperText || error || success || warning) && (
          <div id={helperId} className={cn(helperTextClasses)} role={actualState === 'error' ? 'alert' : undefined}>
            <span>
              {error || success || warning || helperText}
            </span>
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select } 