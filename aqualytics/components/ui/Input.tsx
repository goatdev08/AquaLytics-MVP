import React, { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input variant
   */
  variant?: 'default' | 'phoenix' | 'warm' | 'sunset'
  
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Validation state
   */
  state?: 'default' | 'error' | 'success' | 'warning'
  
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
   * Icon to display before input
   */
  startIcon?: React.ReactNode
  
  /**
   * Icon to display after input
   */
  endIcon?: React.ReactNode
  
  /**
   * Loading state
   */
  loading?: boolean
  
  /**
   * Full width input
   */
  fullWidth?: boolean
  
  /**
   * Required field indicator
   */
  required?: boolean
}

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

const ErrorIcon = () => (
  <svg className="h-4 w-4 text-phoenix-crimson" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="h-4 w-4 text-phoenix-yellow" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)

const WarningIcon = () => (
  <svg className="h-4 w-4 text-phoenix-amber" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

/**
 * Phoenix-themed Input component with validation states and advanced styling.
 * 
 * @param variant - Input style variant
 * @param size - Input size
 * @param state - Validation state
 * @param label - Label text
 * @param helperText - Helper text
 * @param error - Error message
 * @param success - Success message
 * @param warning - Warning message
 * @param startIcon - Icon before input
 * @param endIcon - Icon after input
 * @param loading - Loading state
 * @param fullWidth - Full width input
 * @param required - Required field indicator
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    variant = 'default',
    size = 'md',
    state = 'default',
    label,
    helperText,
    error,
    success,
    warning,
    startIcon,
    endIcon,
    loading = false,
    fullWidth = false,
    required = false,
    className,
    id,
    ...props
  }, ref) => {
    
    // Determine actual state based on props
    const actualState = error ? 'error' : success ? 'success' : warning ? 'warning' : state
    
    // Generate unique ID if not provided (SSR-safe)
    const generatedId = useId()
    const inputId = id || `input-${generatedId}`
    const helperId = `${inputId}-helper`
    
    const baseInputClasses = [
      'block w-full rounded-lg border transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-muted-foreground',
      
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

    const hasStartIcon = startIcon || loading
    const hasEndIcon = endIcon || actualState !== 'default'

    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(labelClasses)}
          >
            {label}
            {required && (
              <span className="text-phoenix-crimson ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Start Icon */}
          {hasStartIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loading ? <LoadingSpinner /> : startIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseInputClasses,
              sizeClasses[size],
              stateClasses[actualState],
              hasStartIcon && 'pl-10',
              hasEndIcon && 'pr-10'
            )}
            aria-invalid={actualState === 'error'}
            aria-describedby={
              (helperText || error || success || warning) ? helperId : undefined
            }
            required={required}
            {...props}
          />
          
          {/* End Icon */}
          {hasEndIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {endIcon || (
                actualState === 'error' ? <ErrorIcon /> :
                actualState === 'success' ? <SuccessIcon /> :
                actualState === 'warning' ? <WarningIcon /> : null
              )}
            </div>
          )}
        </div>
        
        {/* Helper Text / Error / Success / Warning */}
        {(helperText || error || success || warning) && (
          <div id={helperId} className={cn(helperTextClasses)} role={actualState === 'error' ? 'alert' : undefined}>
            {actualState === 'error' && <ErrorIcon />}
            {actualState === 'success' && <SuccessIcon />}
            {actualState === 'warning' && <WarningIcon />}
            <span>
              {error || success || warning || helperText}
            </span>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input } 