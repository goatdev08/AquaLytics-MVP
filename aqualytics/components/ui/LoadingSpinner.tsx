import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner variant based on Phoenix theme
   */
  variant?: 'default' | 'phoenix' | 'warm' | 'sunset' | 'ember' | 'rose' | 'outline' | 'dots'
  
  /**
   * Spinner size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Loading text
   */
  text?: string
  
  /**
   * Text position
   */
  textPosition?: 'bottom' | 'right' | 'left' | 'top'
  
  /**
   * Animation speed
   */
  speed?: 'slow' | 'normal' | 'fast'
  
  /**
   * Show percentage (0-100)
   */
  percentage?: number
  
  /**
   * Center the spinner
   */
  center?: boolean
  
  /**
   * Overlay mode (for covering content)
   */
  overlay?: boolean
}

/**
 * Phoenix-themed LoadingSpinner component with gradient animations.
 * 
 * @param variant - Spinner style variant
 * @param size - Spinner size
 * @param text - Loading text
 * @param textPosition - Text position relative to spinner
 * @param speed - Animation speed
 * @param percentage - Progress percentage (0-100)
 * @param center - Center the spinner
 * @param overlay - Overlay mode
 * @param className - Additional CSS classes
 */
const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    variant = 'default',
    size = 'md',
    text,
    textPosition = 'bottom',
    speed = 'normal',
    percentage,
    center = false,
    overlay = false,
    className,
    ...props
  }, ref) => {
    
    const sizeClasses = {
      xs: 'w-4 h-4',
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16'
    }
    
    const speedClasses = {
      slow: 'animate-[spin_2s_linear_infinite]',
      normal: 'animate-[spin_1s_linear_infinite]',
      fast: 'animate-[spin_0.5s_linear_infinite]'
    }
    
    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    }
    
    const containerClasses = [
      'inline-flex items-center',
      center && 'justify-center',
      textPosition === 'right' && 'flex-row gap-3',
      textPosition === 'left' && 'flex-row-reverse gap-3',
      textPosition === 'top' && 'flex-col-reverse gap-2',
      textPosition === 'bottom' && 'flex-col gap-2'
    ]
    
    const overlayClasses = [
      'fixed inset-0 bg-background/50 backdrop-blur-sm',
      'flex items-center justify-center z-50'
    ]

    const renderSpinner = () => {
      switch (variant) {
        case 'phoenix':
          return (
            <div className={cn(sizeClasses[size], 'relative')}>
              <svg
                className={cn(speedClasses[speed], 'text-phoenix-red')}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="url(#phoenixGradient)"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                <defs>
                  <linearGradient id="phoenixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--phoenix-red)" />
                    <stop offset="50%" stopColor="var(--phoenix-orange)" />
                    <stop offset="100%" stopColor="var(--phoenix-yellow)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )
          
        case 'warm':
          return (
            <div className={cn(sizeClasses[size], 'relative')}>
              <svg
                className={cn(speedClasses[speed], 'text-phoenix-orange')}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="url(#warmGradient)"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                <defs>
                  <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--phoenix-orange)" />
                    <stop offset="100%" stopColor="var(--phoenix-yellow)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )
          
        case 'sunset':
          return (
            <div className={cn(sizeClasses[size], 'relative')}>
              <svg
                className={cn(speedClasses[speed], 'text-phoenix-sunset')}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="url(#sunsetGradient)"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                <defs>
                  <linearGradient id="sunsetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--phoenix-sunset)" />
                    <stop offset="50%" stopColor="var(--phoenix-amber)" />
                    <stop offset="100%" stopColor="var(--phoenix-gold)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )
          
        case 'ember':
          return (
            <div className={cn(sizeClasses[size], 'relative')}>
              <svg
                className={cn(speedClasses[speed], 'text-phoenix-ember')}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="url(#emberGradient)"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                <defs>
                  <linearGradient id="emberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--phoenix-ember)" />
                    <stop offset="50%" stopColor="var(--phoenix-coral)" />
                    <stop offset="100%" stopColor="var(--phoenix-dawn)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )
          
        case 'rose':
          return (
            <div className={cn(sizeClasses[size], 'relative')}>
              <svg
                className={cn(speedClasses[speed], 'text-phoenix-rose')}
                fill="none"
                viewBox="0 0 24 24"
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
                  fill="url(#roseGradient)"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                <defs>
                  <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--phoenix-rose)" />
                    <stop offset="100%" stopColor="var(--phoenix-coral)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )
          
        case 'outline':
          return (
            <div className={cn(sizeClasses[size], speedClasses[speed], 'relative')}>
              <div className="absolute inset-0 rounded-full border-2 border-phoenix-red/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-phoenix-red animate-spin" />
            </div>
          )
          
        case 'dots':
          return (
            <div className="flex space-x-1">
              <div className={cn(
                'rounded-full bg-phoenix-red',
                size === 'xs' ? 'w-1 h-1' : 
                size === 'sm' ? 'w-1.5 h-1.5' : 
                size === 'md' ? 'w-2 h-2' : 
                size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3',
                'animate-bounce [animation-delay:-0.3s]'
              )} />
              <div className={cn(
                'rounded-full bg-phoenix-orange',
                size === 'xs' ? 'w-1 h-1' : 
                size === 'sm' ? 'w-1.5 h-1.5' : 
                size === 'md' ? 'w-2 h-2' : 
                size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3',
                'animate-bounce [animation-delay:-0.15s]'
              )} />
              <div className={cn(
                'rounded-full bg-phoenix-yellow',
                size === 'xs' ? 'w-1 h-1' : 
                size === 'sm' ? 'w-1.5 h-1.5' : 
                size === 'md' ? 'w-2 h-2' : 
                size === 'lg' ? 'w-2.5 h-2.5' : 'w-3 h-3',
                'animate-bounce'
              )} />
            </div>
          )
          
        default:
          return (
            <svg
              className={cn(sizeClasses[size], speedClasses[speed], 'text-phoenix-red')}
              fill="none"
              viewBox="0 0 24 24"
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
      }
    }

    const content = (
      <div
        ref={ref}
        className={cn(
          containerClasses,
          overlay && overlayClasses,
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={text || 'Cargando...'}
        {...props}
      >
        {renderSpinner()}
        
        {text && (
          <div className={cn(
            textSizeClasses[size],
            'text-muted-foreground font-medium'
          )}>
            {text}
            {percentage !== undefined && (
              <span className="text-phoenix-red ml-1">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        {percentage !== undefined && !text && (
          <div className={cn(
            textSizeClasses[size],
            'text-phoenix-red font-semibold'
          )}>
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )

    return overlay ? content : content
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner } 